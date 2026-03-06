import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreatePromocodeDto {
  @ApiProperty({ example: 'SUMMER2024' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 15, minimum: 1, maximum: 100 })
  @IsNumber()
  @Min(1)
  @Max(100)
  discountPercent: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  maxUsages: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  maxUsagesPerUser: number;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
