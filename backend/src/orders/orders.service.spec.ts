import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';
import { UsersService } from '../users/users.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let model: Record<string, jest.Mock>;
  let usersService: Record<string, jest.Mock>;

  beforeEach(async () => {
    model = {
      create: jest.fn(),
      find: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
    };

    usersService = {
      findOne: jest.fn().mockResolvedValue({ _id: 'user-1', name: 'John', email: 'john@test.com' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: model },
        { provide: UsersService, useValue: usersService },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should create an order', async () => {
    const expected = { _id: 'order-1', userId: 'user-1', amount: 100 };
    model.create.mockResolvedValue(expected);

    const result = await service.create('user-1', { amount: 100 });

    expect(result).toEqual(expected);
    expect(model.create).toHaveBeenCalledWith({
      userId: 'user-1',
      amount: 100,
    });
  });

  it('should find orders by user', async () => {
    const orders = [
      { _id: 'order-1', userId: 'user-1', amount: 100 },
      { _id: 'order-2', userId: 'user-1', amount: 200 },
    ];
    model.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(orders) });

    const result = await service.findByUser('user-1');

    expect(result).toEqual(orders);
    expect(model.find).toHaveBeenCalledWith({ userId: 'user-1' });
  });

  it('should find one order by id', async () => {
    const order = { _id: 'order-1', userId: 'user-1', amount: 100 };
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(order),
    });

    const result = await service.findOne('order-1');

    expect(result).toEqual(order);
    expect(model.findById).toHaveBeenCalledWith('order-1');
  });

  it('should throw NotFoundException when order not found', async () => {
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });
});
