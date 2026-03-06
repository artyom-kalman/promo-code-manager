import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SYNC_EVENTS } from '../clickhouse/sync-events';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    try {
      const createdUser = await this.userModel.create({
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        hashedPassword,
      });

      const user = (await this.userModel
        .findById(createdUser._id)
        .exec()) as UserDocument;
      this.eventEmitter.emit(SYNC_EVENTS.USER_CHANGED, { user });
      return user;
    } catch (error: unknown) {
      if (error instanceof Object && 'code' in error && error.code === 11000) {
        throw new ConflictException(
          'User with this email or phone already exists',
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+hashedPassword').exec();
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, dto, { returnDocument: 'after' })
      .exec();
    if (!user) throw new NotFoundException('User not found');
    this.eventEmitter.emit(SYNC_EVENTS.USER_CHANGED, { user });
    return user;
  }

  async deactivate(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' })
      .exec();
    if (!user) throw new NotFoundException('User not found');
    this.eventEmitter.emit(SYNC_EVENTS.USER_CHANGED, { user });
    return user;
  }
}
