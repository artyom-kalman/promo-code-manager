export interface PaginateResponse<T> {
  data: T[];
  page: number;
  total: number;
  pageSize: number;
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
