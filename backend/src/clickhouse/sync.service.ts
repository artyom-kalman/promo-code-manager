import { Injectable, Logger } from '@nestjs/common';
import { ClickHouseService } from './clickhouse.service';
import { UserDocument } from '../users/schemas/user.schema';
import { PromocodeDocument } from '../promocodes/schemas/promocode.schema';
import { OrderDocument } from '../orders/schemas/order.schema';
import { PromoUsageDocument } from '../promo-usages/schemas/promo-usage.schema';

/** Helper: extract Unix timestamp from a Mongoose timestamps field */
function toUnix(date: unknown): number {
  return Math.floor(new Date(date as string).getTime() / 1000);
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_DELAY_MS = 1000;

  constructor(private readonly clickhouse: ClickHouseService) {}

  private async syncWithRetry(
    fn: () => Promise<void>,
    entity: string,
    id: string,
  ): Promise<void> {
    for (let attempt = 1; attempt <= SyncService.MAX_RETRIES; attempt++) {
      try {
        await fn();
        return;
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        if (attempt < SyncService.MAX_RETRIES) {
          const delay = SyncService.BASE_DELAY_MS * 2 ** (attempt - 1);
          this.logger.warn(
            `Sync ${entity} ${id} failed (attempt ${attempt}/${SyncService.MAX_RETRIES}), retrying in ${delay}ms: ${msg}`,
          );
          await new Promise((r) => setTimeout(r, delay));
        } else {
          this.logger.error(
            `Failed to sync ${entity} ${id} after ${SyncService.MAX_RETRIES} attempts: ${msg}`,
          );
        }
      }
    }
  }

  async syncUser(user: UserDocument) {
    await this.syncWithRetry(
      () =>
        this.clickhouse.insert('users', [
          {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            is_active: user.isActive ? 1 : 0,
            created_at: toUnix(user.createdAt),
            updated_at: toUnix(user.updatedAt),
          },
        ]),
      'user',
      String(user._id),
    );
  }

  async syncPromocode(promo: PromocodeDocument) {
    await this.syncWithRetry(
      () =>
        this.clickhouse.insert('promocodes', [
          {
            id: promo._id.toString(),
            code: promo.code,
            discount_percent: promo.discountPercent,
            max_usages: promo.maxUsages,
            max_usages_per_user: promo.maxUsagesPerUser,
            start_date: promo.startDate ? toUnix(promo.startDate) : null,
            end_date: promo.endDate ? toUnix(promo.endDate) : null,
            is_active: promo.isActive ? 1 : 0,
            created_at: toUnix(promo.createdAt),
            updated_at: toUnix(promo.updatedAt),
          },
        ]),
      'promocode',
      String(promo._id),
    );
  }

  async syncOrder(
    order: OrderDocument,
    user: UserDocument,
    discountAmount: number = 0,
    promocode?: PromocodeDocument,
  ) {
    await this.syncWithRetry(
      () =>
        this.clickhouse.insert('orders', [
          {
            id: order._id.toString(),
            user_id: order.userId.toString(),
            user_name: user.name,
            user_email: user.email,
            amount: order.amount,
            promocode_id: order.promocodeId
              ? order.promocodeId.toString()
              : null,
            promocode_code: promocode ? promocode.code : null,
            discount_amount: discountAmount,
            created_at: toUnix(order.createdAt),
            updated_at: toUnix(order.updatedAt),
          },
        ]),
      'order',
      String(order._id),
    );
  }

  async syncPromoUsage(
    usage: PromoUsageDocument,
    user: UserDocument,
    promocode: PromocodeDocument,
  ) {
    await this.syncWithRetry(
      () =>
        this.clickhouse.insert('promo_usages', [
          {
            id: usage._id.toString(),
            user_id: usage.userId.toString(),
            user_name: user.name,
            user_email: user.email,
            order_id: usage.orderId.toString(),
            promocode_id: usage.promocodeId.toString(),
            promocode_code: promocode.code,
            discount_amount: usage.discountAmount,
            created_at: toUnix(usage.createdAt),
          },
        ]),
      'promo_usage',
      String(usage._id),
    );
  }
}
