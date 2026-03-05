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

export class GetPromoUsageAnalyticsDto {
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
  @IsIn(['created_at', 'discount_amount', 'user_name', 'promocode_code'])
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
  userId: string;

  @IsString()
  @IsOptional()
  promocodeId: string;

  @IsString()
  @IsOptional()
  promocodeCode: string;

  @IsString()
  @IsOptional()
  userName: string;

  @IsString()
  @IsOptional()
  userEmail: string;
}
