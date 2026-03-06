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

export class GetUserAnalyticsDto {
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
      'name',
      'email',
      'is_active',
      'created_at',
      'total_orders',
      'total_spent',
      'promocodes_used',
    ],
    default: 'created_at',
  })
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

  @ApiPropertyOptional({ example: 'John', description: 'Filter by user name' })
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'Filter by email',
  })
  @IsString()
  @IsOptional()
  email: string;

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
}
