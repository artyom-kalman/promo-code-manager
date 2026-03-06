export interface Promocode {
  _id: string;
  code: string;
  discountPercent: number;
  maxUsages: number;
  maxUsagesPerUser: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromocodeDto {
  code: string;
  discountPercent: number;
  maxUsages: number;
  maxUsagesPerUser: number;
  startDate?: string;
  endDate?: string;
}

export type UpdatePromocodeDto = Partial<CreatePromocodeDto>;
