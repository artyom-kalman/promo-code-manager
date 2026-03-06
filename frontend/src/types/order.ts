import type { Promocode } from './promocode';

export interface Order {
  _id: string;
  userId: string;
  amount: number;
  promocodeId?: Promocode | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  amount: number;
}

export interface ApplyPromocodeDto {
  code: string;
}
