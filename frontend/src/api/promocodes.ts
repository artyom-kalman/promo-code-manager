import api from '../lib/axios';
import type {
  Promocode,
  CreatePromocodeDto,
  UpdatePromocodeDto,
} from '../types/promocode';

export async function getPromocodes(): Promise<Promocode[]> {
  const { data } = await api.get<Promocode[]>('/promocodes');
  return data;
}

export async function getPromocodeById(id: string): Promise<Promocode> {
  const { data } = await api.get<Promocode>(`/promocodes/${id}`);
  return data;
}

export async function createPromocode(
  dto: CreatePromocodeDto,
): Promise<Promocode> {
  const { data } = await api.post<Promocode>('/promocodes', dto);
  return data;
}

export async function updatePromocode(
  id: string,
  dto: UpdatePromocodeDto,
): Promise<Promocode> {
  const { data } = await api.patch<Promocode>(`/promocodes/${id}`, dto);
  return data;
}

export async function deactivatePromocode(id: string): Promise<void> {
  await api.delete(`/promocodes/${id}`);
}
