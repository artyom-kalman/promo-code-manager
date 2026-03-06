import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UsersService } from '../users/users.service';
import { SYNC_EVENTS } from '../clickhouse/sync-events';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateOrderDto): Promise<OrderDocument> {
    const order = await this.orderModel.create({
      userId,
      amount: dto.amount,
    });
    this.usersService
      .findOne(userId)
      .then((user) => {
        if (user) {
          this.eventEmitter.emit(SYNC_EVENTS.ORDER_CREATED, { order, user });
        }
      })
      .catch((err) => {
        this.logger.error('Failed to emit order created event', err);
      });
    return order;
  }

  async findByUser(userId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ userId }).exec();
  }

  async findOne(id: string, userId?: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userId && userId !== order.userId.toString()) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
