import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PromoUsage, PromoUsageDocument } from './schemas/promo-usage.schema';

@Injectable()
export class PromoUsagesService {
  constructor(
    @InjectModel(PromoUsage.name) private promoUsageModel: Model<PromoUsage>,
  ) {}

  async create(data: {
    userId: string | Types.ObjectId;
    orderId: string | Types.ObjectId;
    promocodeId: string | Types.ObjectId;
    discountAmount: number;
  }): Promise<PromoUsageDocument> {
    return this.promoUsageModel.create(data);
  }

  async countByPromocode(
    promocodeId: string | Types.ObjectId,
  ): Promise<number> {
    return this.promoUsageModel.countDocuments({ promocodeId }).exec();
  }

  async countByPromocodeAndUser(
    promocodeId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<number> {
    return this.promoUsageModel.countDocuments({ promocodeId, userId }).exec();
  }
}
