import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApplyPromocodeDto } from './dto/apply-promocode.dto';
import { ApplyPromocodeService } from './apply-promocode.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly applyPromocodeService: ApplyPromocodeService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get orders for the current user' })
  @ApiResponse({ status: 200, description: 'List of user orders' })
  findByUser(@CurrentUser() user: { userId: string }) {
    return this.ordersService.findByUser(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({ status: 200, description: 'Order found' })
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.ordersService.findOne(id, user.userId);
  }

  @Post(':id/apply-promocode')
  @ApiOperation({ summary: 'Apply a promocode to an order' })
  @ApiResponse({ status: 200, description: 'Promocode applied successfully' })
  applyPromocode(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: ApplyPromocodeDto,
  ) {
    return this.applyPromocodeService.apply(user.userId, id, dto);
  }
}
