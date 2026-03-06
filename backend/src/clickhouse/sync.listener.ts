import { Injectable } from '@nestjs/common';
import { SyncService } from './sync.service';
import type {
  OrderCreatedEvent,
  OrderPromoAppliedEvent,
  PromocodeChangedEvent,
  PromoUsageCreatedEvent,
  UserChangedEvent,
} from './sync-events';
import { SYNC_EVENTS } from './sync-events';
import { OnEvent } from '@nestjs/event-emitter';
import { CacheService } from '../redis/cache.service';

@Injectable()
export class SyncListener {
  constructor(
    private readonly syncService: SyncService,
    private readonly cacheService: CacheService,
  ) {}

  @OnEvent(SYNC_EVENTS.USER_CHANGED, { async: true })
  async handleUserChanged(payload: UserChangedEvent) {
    await this.syncService.syncUser(payload.user);
    await this.cacheService.invalidateByPrefix('analytics:users:');
  }

  @OnEvent(SYNC_EVENTS.PROMOCODE_CHANGED, { async: true })
  async handlePromocodeChanged(payload: PromocodeChangedEvent) {
    await this.syncService.syncPromocode(payload.promocode);
    await this.cacheService.invalidateByPrefix('analytics:promocodes:');
    await this.cacheService.invalidateByPrefix('analytics:promo-usages:');
  }

  @OnEvent(SYNC_EVENTS.ORDER_CREATED, { async: true })
  async handleOrderCreated(payload: OrderCreatedEvent) {
    await this.syncService.syncOrder(payload.order, payload.user);
    await this.cacheService.invalidateByPrefix('analytics:users:');
  }

  @OnEvent(SYNC_EVENTS.ORDER_PROMO_APPLIED, { async: true })
  async handleOrderPromoApplied(payload: OrderPromoAppliedEvent) {
    await this.syncService.syncOrder(
      payload.order,
      payload.user,
      payload.discountAmount,
      payload.promocode,
    );
    await this.cacheService.invalidateByPrefix('analytics:promo-usages:');
    await this.cacheService.invalidateByPrefix('analytics:promocodes:');
    await this.cacheService.invalidateByPrefix('analytics:users:');
  }

  @OnEvent(SYNC_EVENTS.PROMO_USAGE_CREATED, { async: true })
  async handlePromoUsageCreated(payload: PromoUsageCreatedEvent) {
    await this.syncService.syncPromoUsage(
      payload.usage,
      payload.user,
      payload.promocode,
    );
    await this.cacheService.invalidateByPrefix('analytics:promo-usages:');
    await this.cacheService.invalidateByPrefix('analytics:promocodes:');
  }
}
