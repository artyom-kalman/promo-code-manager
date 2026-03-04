import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ApplyPromocodeService } from './apply-promocode.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { PromocodesModule } from '../promocodes/promocodes.module';
import { PromoUsagesModule } from '../promo-usages/promo-usages.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    PromocodesModule,
    PromoUsagesModule,
    UsersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, ApplyPromocodeService],
  exports: [OrdersService],
})
export class OrdersModule {}
