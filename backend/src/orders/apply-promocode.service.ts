import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, OrderDocument } from './schemas/order.schema';
import { PromocodesService } from '../promocodes/promocodes.service';
import { PromoUsagesService } from '../promo-usages/promo-usages.service';
import { UsersService } from '../users/users.service';
import { ApplyPromocodeDto } from './dto/apply-promocode.dto';
import { LockService } from '../redis/lock.service';
import { SYNC_EVENTS } from '../clickhouse/sync-events';
import { PromoUsageDocument } from '../promo-usages/schemas/promo-usage.schema';
import { PromocodeDocument } from '../promocodes/schemas/promocode.schema';

@Injectable()
export class ApplyPromocodeService {
  private readonly logger = new Logger(ApplyPromocodeService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly promocodesService: PromocodesService,
    private readonly promoUsagesService: PromoUsagesService,
    private readonly usersService: UsersService,
    private readonly lockService: LockService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async apply(userId: string, orderId: string, dto: ApplyPromocodeDto) {
    const releaseOrderLock = await this.lockService.acquire(
      `lock:order:${orderId}`,
    );
    if (!releaseOrderLock) {
      throw new ConflictException(
        'Another promocode operation is in progress for this order',
      );
    }

    let releasePromoLock: (() => Promise<void>) | null = null;
    let updatedOrder: OrderDocument | null = null;
    let promoUsage: PromoUsageDocument | null = null;
    let promocode: PromocodeDocument | null = null;
    let discountAmount: number;

    try {
      const order = await this.orderModel.findById(orderId).exec();
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.userId.toString() !== userId) {
        throw new ForbiddenException('Order does not belong to you');
      }

      if (order.promocodeId) {
        throw new BadRequestException(
          'Promocode already applied to this order',
        );
      }

      promocode = await this.promocodesService.findByCode(dto.code);
      if (!promocode) {
        throw new NotFoundException('Promocode not found');
      }

      if (!promocode.isActive) {
        throw new BadRequestException('Promocode is not active');
      }

      const now = new Date();
      if (promocode.startDate && now < promocode.startDate) {
        throw new BadRequestException('Promocode is not yet active');
      }
      if (promocode.endDate && now > promocode.endDate) {
        throw new BadRequestException('Promocode expired');
      }

      releasePromoLock = await this.lockService.acquire(
        `lock:promocode:${String(promocode._id)}`,
      );
      if (!releasePromoLock) {
        throw new ConflictException(
          'Another promocode operation is in progress, please retry',
        );
      }

      const totalUsages = await this.promoUsagesService.countByPromocode(
        promocode._id,
      );
      if (totalUsages >= promocode.maxUsages) {
        throw new BadRequestException('Usage limit reached');
      }

      const userUsages = await this.promoUsagesService.countByPromocodeAndUser(
        promocode._id,
        userId,
      );
      if (userUsages >= promocode.maxUsagesPerUser) {
        throw new BadRequestException('Per-user limit reached');
      }

      discountAmount = (order.amount * promocode.discountPercent) / 100;

      updatedOrder = await this.orderModel
        .findByIdAndUpdate(
          orderId,
          { promocodeId: promocode._id },
          { returnDocument: 'after' },
        )
        .exec();

      promoUsage = await this.promoUsagesService.create({
        userId,
        orderId,
        promocodeId: promocode._id,
        discountAmount,
      });

      return updatedOrder;
    } finally {
      if (releasePromoLock) {
        await releasePromoLock();
      }
      await releaseOrderLock();

      if (updatedOrder && promoUsage) {
        this.usersService
          .findOne(userId)
          .then((user) => {
            if (!user) return;

            this.eventEmitter.emit(SYNC_EVENTS.ORDER_PROMO_APPLIED, {
              order: updatedOrder,
              user,
              discountAmount,
              promocode,
            });
            this.eventEmitter.emit(SYNC_EVENTS.PROMO_USAGE_CREATED, {
              usage: promoUsage,
              user,
              promocode,
            });
          })
          .catch((err) => {
            this.logger.error('Failed to emit promo apply events', err);
          });
      }
    }
  }
}
