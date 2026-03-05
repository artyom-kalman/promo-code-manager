import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Promocode, PromocodeDocument } from './schemas/promocode.schema';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import { SYNC_EVENTS } from '../clickhouse/sync-events';

@Injectable()
export class PromocodesService {
  constructor(
    @InjectModel(Promocode.name) private promocodeModel: Model<Promocode>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreatePromocodeDto): Promise<PromocodeDocument> {
    try {
      const promocode = await this.promocodeModel.create(dto);
      this.eventEmitter.emit(SYNC_EVENTS.PROMOCODE_CHANGED, { promocode });
      return promocode;
    } catch (error: unknown) {
      if (error instanceof Object && 'code' in error && error.code === 11000) {
        throw new ConflictException('Promocode with this code already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<PromocodeDocument[]> {
    return this.promocodeModel.find().exec();
  }

  async findOne(id: string): Promise<PromocodeDocument> {
    const promocode = await this.promocodeModel.findById(id).exec();
    if (!promocode) throw new NotFoundException('Promocode not found');
    return promocode;
  }

  async findByCode(code: string): Promise<PromocodeDocument | null> {
    return this.promocodeModel.findOne({ code: code.toUpperCase() }).exec();
  }

  async update(
    id: string,
    dto: UpdatePromocodeDto,
  ): Promise<PromocodeDocument> {
    const promocode = await this.promocodeModel
      .findByIdAndUpdate(id, dto, { returnDocument: 'after' })
      .exec();
    if (!promocode) throw new NotFoundException('Promocode not found');
    this.eventEmitter.emit(SYNC_EVENTS.PROMOCODE_CHANGED, { promocode });
    return promocode;
  }

  async deactivate(id: string): Promise<PromocodeDocument> {
    const promocode = await this.promocodeModel
      .findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' })
      .exec();
    if (!promocode) throw new NotFoundException('Promocode not found');
    this.eventEmitter.emit(SYNC_EVENTS.PROMOCODE_CHANGED, { promocode });
    return promocode;
  }
}
