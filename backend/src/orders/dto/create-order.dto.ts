import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @IsPositive()
  amount: number;
}
