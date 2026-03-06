import { ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100, default: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  pageSize: number = 20;

  @ApiPropertyOptional({
    example: 'created_at',
    enum: [
      'code',
      'discount_percent',
      'is_active',
      'created_at',
      'total_usages',
      'unique_users',
      'total_revenue',
      'total_discount_given',
    ],
    default: 'created_at',
  })
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

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['desc', 'asc'],
    default: 'desc',
  })
  @IsString()
  @IsOptional()
  @IsIn(['desc', 'asc'])
  sortOrder: string = 'desc';

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  dateFrom: string;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  dateTo: string;

  @ApiPropertyOptional({
    example: 'SUMMER2024',
    description: 'Filter by promocode',
  })
  @IsString()
  @IsOptional()
  code: string;

  @ApiPropertyOptional({
    example: 1,
    enum: [0, 1],
    description: 'Filter by active status',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsIn([0, 1])
  isActive: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Minimum discount percent filter',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  discountPercentMin: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Maximum discount percent filter',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  discountPercentMax: number;
}
