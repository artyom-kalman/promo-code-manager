import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PromocodeDocument = HydratedDocument<Promocode>;

@Schema({ timestamps: true })
export class Promocode {
  @Prop({ required: true, unique: true, uppercase: true })
  code: string;

  @Prop({ required: true })
  discountPercent: number;

  @Prop({ required: true })
  maxUsages: number;

  @Prop({ required: true })
  maxUsagesPerUser: number;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ required: true, default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const PromocodeSchema = SchemaFactory.createForClass(Promocode);
