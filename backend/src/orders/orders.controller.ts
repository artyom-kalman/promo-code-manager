import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApplyPromocodeDto } from './dto/apply-promocode.dto';
import { ApplyPromocodeService } from './apply-promocode.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly applyPromocodeService: ApplyPromocodeService,
  ) {}

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.userId, dto);
  }

  @Get()
  findByUser(@CurrentUser() user: { userId: string }) {
    return this.ordersService.findByUser(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post(':id/apply-promocode')
  applyPromocode(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: ApplyPromocodeDto,
  ) {
    return this.applyPromocodeService.apply(user.userId, id, dto);
  }
}
