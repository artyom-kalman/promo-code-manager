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

export class GetUserAnalyticsDto {
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
    'name',
    'email',
    'is_active',
    'created_at',
    'total_orders',
    'total_spent',
    'promocodes_used',
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
  name: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsIn([0, 1])
  isActive: number;
}
