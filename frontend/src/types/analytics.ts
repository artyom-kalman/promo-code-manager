export interface AnalyticsQueryParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface UserAnalyticsParams extends AnalyticsQueryParams {
  name?: string;
  email?: string;
  isActive?: string;
}

export interface PromocodeAnalyticsParams extends AnalyticsQueryParams {
  code?: string;
  isActive?: string;
  discountPercentMin?: number;
  discountPercentMax?: number;
}

export interface PromoUsageAnalyticsParams extends AnalyticsQueryParams {
  userName?: string;
  userEmail?: string;
  promocodeCode?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface UserAnalyticsRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  totalDiscount: number;
  promocodesUsed: number;
}

export interface PromocodeAnalyticsRow {
  id: string;
  code: string;
  discountPercent: number;
  maxUsages: number;
  maxUsagesPerUser: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  totalUsages: number;
  uniqueUsers: number;
  totalRevenue: number;
  totalDiscountGiven: number;
}

export interface PromoUsageAnalyticsRow {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId: string;
  promocodeId: string;
  promocodeCode: string;
  discountAmount: number;
  createdAt: string;
}
