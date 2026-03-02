import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromoUsagesService } from './promo-usages.service';
import { PromoUsage, PromoUsageSchema } from './schemas/promo-usage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PromoUsage.name, schema: PromoUsageSchema },
    ]),
  ],
  providers: [PromoUsagesService],
  exports: [PromoUsagesService],
})
export class PromoUsagesModule {}
