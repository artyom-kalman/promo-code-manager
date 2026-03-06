import api from '../lib/axios';
import type {
  PaginatedResponse,
  UserAnalyticsRow,
  UserAnalyticsParams,
  PromocodeAnalyticsRow,
  PromocodeAnalyticsParams,
  PromoUsageAnalyticsRow,
  PromoUsageAnalyticsParams,
} from '../types/analytics';

export async function fetchUserAnalytics(
  params: UserAnalyticsParams,
): Promise<PaginatedResponse<UserAnalyticsRow>> {
  const { data } = await api.get<PaginatedResponse<UserAnalyticsRow>>(
    '/analytics/users',
    { params },
  );
  return data;
}

export async function fetchPromocodeAnalytics(
  params: PromocodeAnalyticsParams,
): Promise<PaginatedResponse<PromocodeAnalyticsRow>> {
  const { data } = await api.get<PaginatedResponse<PromocodeAnalyticsRow>>(
    '/analytics/promocodes',
    { params },
  );
  return data;
}

export async function fetchPromoUsageAnalytics(
  params: PromoUsageAnalyticsParams,
): Promise<PaginatedResponse<PromoUsageAnalyticsRow>> {
  const { data } = await api.get<PaginatedResponse<PromoUsageAnalyticsRow>>(
    '/analytics/promo-usages',
    { params },
  );
  return data;
}
