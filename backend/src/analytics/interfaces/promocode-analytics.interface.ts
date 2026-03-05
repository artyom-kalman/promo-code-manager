export interface PaginateResponse<T> {
  data: T[];
  page: number;
  total: number;
  pageSize: number;
}

export interface PromocodeAnalyticsRow {
  id: string;
  code: string;
  discountPercent: number;
  maxUsages: number;
  maxUsagesPerUser: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  totalUsages: number;
  uniqueUsers: number;
  totalRevenue: number;
  totalDiscountGiven: number;
}
