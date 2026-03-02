import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Promocode, PromocodeDocument } from './schemas/promocode.schema';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';

@Injectable()
export class PromocodesService {
  constructor(
    @InjectModel(Promocode.name) private promocodeModel: Model<Promocode>,
  ) {}

  async create(dto: CreatePromocodeDto): Promise<PromocodeDocument> {
    try {
      return await this.promocodeModel.create(dto);
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
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!promocode) throw new NotFoundException('Promocode not found');
    return promocode;
  }

  async deactivate(id: string): Promise<PromocodeDocument> {
    const promocode = await this.promocodeModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    if (!promocode) throw new NotFoundException('Promocode not found');
    return promocode;
  }
}
