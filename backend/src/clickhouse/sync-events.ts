import { PromocodeDocument } from '../promocodes/schemas/promocode.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { OrderDocument } from '../orders/schemas/order.schema';
import { PromoUsageDocument } from '../promo-usages/schemas/promo-usage.schema';

export const SYNC_EVENTS = {
  USER_CHANGED: 'sync.user.changed',
  PROMOCODE_CHANGED: 'sync.promocode.changed',
  ORDER_CREATED: 'sync.order.created',
  ORDER_PROMO_APPLIED: 'sync.order.promoApplied',
  PROMO_USAGE_CREATED: 'sync.promoUsage.created',
} as const;

export interface UserChangedEvent {
  user: UserDocument;
}

export interface PromocodeChangedEvent {
  promocode: PromocodeDocument;
}

export interface OrderCreatedEvent {
  order: OrderDocument;
  user: UserDocument;
}

export interface OrderPromoAppliedEvent {
  order: OrderDocument;
  user: UserDocument;
  discountAmount: number;
  promocode: PromocodeDocument;
}

export interface PromoUsageCreatedEvent {
  usage: PromoUsageDocument;
  user: UserDocument;
  promocode: PromocodeDocument;
}
