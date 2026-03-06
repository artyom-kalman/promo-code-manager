import api from '../lib/axios';
import type { Order, CreateOrderDto, ApplyPromocodeDto } from '../types/order';

export async function createOrder(dto: CreateOrderDto): Promise<Order> {
  const { data } = await api.post<Order>('/orders', dto);
  return data;
}

export async function getMyOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/orders');
  return data;
}

export async function applyPromocode(
  orderId: string,
  dto: ApplyPromocodeDto,
): Promise<Order> {
  const { data } = await api.post<Order>(
    `/orders/${orderId}/apply-promocode`,
    dto,
  );
  return data;
}
