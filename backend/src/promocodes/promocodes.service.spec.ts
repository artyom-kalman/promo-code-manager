import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PromocodesService } from './promocodes.service';
import { Promocode } from './schemas/promocode.schema';

describe('PromocodesService', () => {
  let service: PromocodesService;
  let model: Record<string, jest.Mock>;

  beforeEach(async () => {
    model = {
      create: jest.fn(),
      find: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromocodesService,
        { provide: getModelToken(Promocode.name), useValue: model },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<PromocodesService>(PromocodesService);
  });

  const mockPromocode = {
    _id: 'promo-1',
    code: 'SAVE10',
    discountPercent: 10,
    maxUsages: 100,
    maxUsagesPerUser: 1,
    isActive: true,
  };

  const createDto = {
    code: 'SAVE10',
    discountPercent: 10,
    maxUsages: 100,
    maxUsagesPerUser: 1,
  };

  it('should create a promocode', async () => {
    model.create.mockResolvedValue(mockPromocode);

    const result = await service.create(createDto);

    expect(result).toEqual(mockPromocode);
    expect(model.create).toHaveBeenCalledWith(createDto);
  });

  it('should throw ConflictException on duplicate code', async () => {
    model.create.mockRejectedValue({ code: 11000 });

    await expect(service.create(createDto)).rejects.toThrow(ConflictException);
  });

  it('should rethrow non-duplicate errors', async () => {
    const error = new Error('DB error');
    model.create.mockRejectedValue(error);

    await expect(service.create(createDto)).rejects.toThrow('DB error');
  });

  it('should find all promocodes', async () => {
    const promos = [mockPromocode];
    model.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(promos) });

    const result = await service.findAll();

    expect(result).toEqual(promos);
  });

  it('should find one by id', async () => {
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockPromocode),
    });

    const result = await service.findOne('promo-1');

    expect(result).toEqual(mockPromocode);
  });

  it('should throw NotFoundException when findOne not found', async () => {
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should findByCode and uppercase the input', async () => {
    model.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockPromocode),
    });

    const result = await service.findByCode('save10');

    expect(result).toEqual(mockPromocode);
    expect(model.findOne).toHaveBeenCalledWith({ code: 'SAVE10' });
  });

  it('should return null when findByCode finds nothing', async () => {
    model.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const result = await service.findByCode('NOCODE');

    expect(result).toBeNull();
  });

  it('should update a promocode', async () => {
    const updated = { ...mockPromocode, discountPercent: 20 };
    model.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updated),
    });

    const result = await service.update('promo-1', { discountPercent: 20 });

    expect(result).toEqual(updated);
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      'promo-1',
      { discountPercent: 20 },
      { new: true },
    );
  });

  it('should throw NotFoundException when update not found', async () => {
    model.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.update('nonexistent', { discountPercent: 20 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should deactivate a promocode', async () => {
    const deactivated = { ...mockPromocode, isActive: false };
    model.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(deactivated),
    });

    const result = await service.deactivate('promo-1');

    expect(result).toEqual(deactivated);
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      'promo-1',
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
