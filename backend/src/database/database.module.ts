import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  Promocode,
  PromocodeSchema,
} from '../promocodes/schemas/promocode.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import {
  PromoUsage,
  PromoUsageSchema,
} from '../promo-usages/schemas/promo-usage.schema';
import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URL'),
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Promocode.name, schema: PromocodeSchema },
      { name: Order.name, schema: OrderSchema },
      { name: PromoUsage.name, schema: PromoUsageSchema },
    ]),
  ],
  providers: [SeedService],
})
export class DatabaseModule {}
