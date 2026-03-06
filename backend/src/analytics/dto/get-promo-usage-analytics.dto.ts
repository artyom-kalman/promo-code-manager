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

export class GetPromoUsageAnalyticsDto {
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
    enum: ['created_at', 'discount_amount', 'user_name', 'promocode_code'],
    default: 'created_at',
  })
  @IsOptional()
  @IsIn(['created_at', 'discount_amount', 'user_name', 'promocode_code'])
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

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsString()
  @IsOptional()
  userId: string;

  @ApiPropertyOptional({ description: 'Filter by promocode ID' })
  @IsString()
  @IsOptional()
  promocodeId: string;

  @ApiPropertyOptional({
    example: 'SUMMER2024',
    description: 'Filter by promocode code',
  })
  @IsString()
  @IsOptional()
  promocodeCode: string;

  @ApiPropertyOptional({ example: 'John', description: 'Filter by user name' })
  @IsString()
  @IsOptional()
  userName: string;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'Filter by user email',
  })
  @IsString()
  @IsOptional()
  userEmail: string;
}
