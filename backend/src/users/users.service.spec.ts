import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let model: Record<string, jest.Mock>;
  const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    model = {
      create: jest.fn(),
      find: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findOne: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ exec: jest.fn() }),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: model },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  const createDto = {
    name: 'John',
    email: 'john@test.com',
    phone: '+1234567890',
    password: 'password123',
  };

  const mockUser = {
    _id: 'user-1',
    name: 'John',
    email: 'john@test.com',
    phone: '+1234567890',
    isActive: true,
  };

  it('should create a user with hashed password', async () => {
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    model.create.mockResolvedValue({ _id: 'user-1' });
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser),
    });

    const result = await service.create(createDto);

    expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(model.create).toHaveBeenCalledWith({
      name: 'John',
      email: 'john@test.com',
      phone: '+1234567890',
      hashedPassword: 'hashed-password',
    });
    expect(model.findById).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(mockUser);
  });

  it('should throw ConflictException on duplicate email/phone (code 11000)', async () => {
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    model.create.mockRejectedValue({ code: 11000 });

    await expect(service.create(createDto)).rejects.toThrow(ConflictException);
  });

  it('should rethrow non-duplicate errors on create', async () => {
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    const error = new Error('DB error');
    model.create.mockRejectedValue(error);

    await expect(service.create(createDto)).rejects.toThrow('DB error');
  });

  it('should find all users', async () => {
    const users = [mockUser];
    model.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(users) });

    const result = await service.findAll();

    expect(result).toEqual(users);
  });

  it('should find one user by id', async () => {
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser),
    });

    const result = await service.findOne('user-1');

    expect(result).toEqual(mockUser);
  });

  it('should throw NotFoundException when findOne not found', async () => {
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should findByEmail with select(+hashedPassword)', async () => {
    const userWithPassword = { ...mockUser, hashedPassword: 'hashed' };
    const exec = jest.fn().mockResolvedValue(userWithPassword);
    const select = jest.fn().mockReturnValue({ exec });
    model.findOne.mockReturnValue({ select });

    const result = await service.findByEmail('john@test.com');

    expect(model.findOne).toHaveBeenCalledWith({ email: 'john@test.com' });
    expect(select).toHaveBeenCalledWith('+hashedPassword');
    expect(result).toEqual(userWithPassword);
  });

  it('should return null when findByEmail finds nothing', async () => {
    const exec = jest.fn().mockResolvedValue(null);
    const select = jest.fn().mockReturnValue({ exec });
    model.findOne.mockReturnValue({ select });

    const result = await service.findByEmail('nobody@test.com');

    expect(result).toBeNull();
  });

  it('should update a user', async () => {
    const updated = { ...mockUser, name: 'Jane' };
    model.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updated),
    });

    const result = await service.update('user-1', { name: 'Jane' });

    expect(result).toEqual(updated);
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      'user-1',
      { name: 'Jane' },
      { new: true },
    );
  });

  it('should throw NotFoundException when update not found', async () => {
    model.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.update('nonexistent', { name: 'Jane' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should deactivate a user', async () => {
    const deactivated = { ...mockUser, isActive: false };
    model.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(deactivated),
    });

    const result = await service.deactivate('user-1');

    expect(result).toEqual(deactivated);
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      'user-1',
      { isActive: false },
      { new: true },
    );
  });

  it('should throw NotFoundException when deactivate not found', async () => {
    model.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.deactivate('nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });
});
