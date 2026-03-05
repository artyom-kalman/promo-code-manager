import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetPromocodeAnalyticsDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page: number = 1;

  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  pageSize: number = 20;

  @IsOptional()
  @IsIn([
    'code',
    'discount_percent',
    'is_active',
    'created_at',
    'total_usages',
    'unique_users',
    'total_revenue',
    'total_discount_given',
  ])
  sortBy: string = 'created_at';

  @IsString()
  @IsOptional()
  @IsIn(['desc', 'asc'])
  sortOrder: string = 'desc';

  @IsDateString()
  @IsOptional()
  dateFrom: string;

  @IsDateString()
  @IsOptional()
  dateTo: string;

  @IsString()
  @IsOptional()
  code: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsIn([0, 1])
  isActive: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  discountPercentMin: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  discountPercentMax: number;
}
