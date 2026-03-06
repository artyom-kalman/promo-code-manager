import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  Promocode,
  PromocodeDocument,
} from '../promocodes/schemas/promocode.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import {
  PromoUsage,
  PromoUsageDocument,
} from '../promo-usages/schemas/promo-usage.schema';
import { SyncService } from '../clickhouse/sync.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Promocode.name) private promocodeModel: Model<Promocode>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(PromoUsage.name) private promoUsageModel: Model<PromoUsage>,
    private readonly syncService: SyncService,
  ) {}

  async onModuleInit() {
    const userCount = await this.userModel.countDocuments();
    if (userCount > 0) {
      this.logger.log('Database already has data, skipping seed');
      return;
    }

    this.logger.log('Seeding database with mock data...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await this.userModel.insertMany([
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+1234567890',
        hashedPassword,
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '+1234567891',
        hashedPassword,
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        phone: '+1234567892',
        hashedPassword,
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567893',
        hashedPassword,
      },
    ]);

    const promocodes = await this.promocodeModel.insertMany([
      {
        code: 'WELCOME10',
        discountPercent: 10,
        maxUsages: 100,
        maxUsagesPerUser: 1,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-12-31'),
      },
      {
        code: 'SUMMER25',
        discountPercent: 25,
        maxUsages: 50,
        maxUsagesPerUser: 2,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2026-09-01'),
      },
      {
        code: 'VIP50',
        discountPercent: 50,
        maxUsages: 10,
        maxUsagesPerUser: 1,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2027-01-01'),
      },
      {
        code: 'FLASH15',
        discountPercent: 15,
        maxUsages: 200,
        maxUsagesPerUser: 3,
        isActive: false,
      },
      {
        code: 'NEWYEAR20',
        discountPercent: 20,
        maxUsages: 150,
        maxUsagesPerUser: 1,
        startDate: new Date('2025-12-25'),
        endDate: new Date('2026-01-15'),
      },
      {
        code: 'LOYAL30',
        discountPercent: 30,
        maxUsages: 30,
        maxUsagesPerUser: 2,
        startDate: new Date('2025-03-01'),
        endDate: new Date('2026-12-31'),
      },
      {
        code: 'SPRING5',
        discountPercent: 5,
        maxUsages: 500,
        maxUsagesPerUser: 5,
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-06-01'),
      },
      {
        code: 'BLACKFRIDAY40',
        discountPercent: 40,
        maxUsages: 20,
        maxUsagesPerUser: 1,
        startDate: new Date('2025-11-28'),
        endDate: new Date('2025-12-01'),
        isActive: false,
      },
      {
        code: 'HOLIDAY35',
        discountPercent: 35,
        maxUsages: 40,
        maxUsagesPerUser: 1,
        startDate: new Date('2025-12-15'),
        endDate: new Date('2026-01-05'),
      },
      {
        code: 'FREESHIP',
        discountPercent: 8,
        maxUsages: 1000,
        maxUsagesPerUser: 10,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2027-01-01'),
      },
      {
        code: 'BIRTHDAY15',
        discountPercent: 15,
        maxUsages: 300,
        maxUsagesPerUser: 1,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2027-01-01'),
      },
      {
        code: 'REFER10',
        discountPercent: 10,
        maxUsages: 500,
        maxUsagesPerUser: 3,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2026-06-01'),
      },
    ]);

    // p[0]=WELCOME10, p[1]=SUMMER25, p[2]=VIP50, p[3]=FLASH15(inactive),
    // p[4]=NEWYEAR20, p[5]=LOYAL30, p[6]=SPRING5, p[7]=BLACKFRIDAY40(inactive),
    // p[8]=HOLIDAY35, p[9]=FREESHIP, p[10]=BIRTHDAY15, p[11]=REFER10

    const orders = await this.orderModel.insertMany([
      // Alice (users[0]) — 6 orders
      { userId: users[0]._id, amount: 100 },
      { userId: users[0]._id, amount: 90, promocodeId: promocodes[0]._id },
      { userId: users[0]._id, amount: 200, promocodeId: promocodes[4]._id },
      { userId: users[0]._id, amount: 55, promocodeId: promocodes[9]._id },
      { userId: users[0]._id, amount: 320, promocodeId: promocodes[5]._id },
      { userId: users[0]._id, amount: 75 },
      // Bob (users[1]) — 7 orders
      { userId: users[1]._id, amount: 200 },
      { userId: users[1]._id, amount: 150, promocodeId: promocodes[1]._id },
      { userId: users[1]._id, amount: 80, promocodeId: promocodes[0]._id },
      { userId: users[1]._id, amount: 110, promocodeId: promocodes[9]._id },
      { userId: users[1]._id, amount: 250, promocodeId: promocodes[11]._id },
      { userId: users[1]._id, amount: 175, promocodeId: promocodes[5]._id },
      { userId: users[1]._id, amount: 60 },
      // Charlie (users[2]) — 7 orders
      { userId: users[2]._id, amount: 50, promocodeId: promocodes[2]._id },
      { userId: users[2]._id, amount: 300 },
      { userId: users[2]._id, amount: 130, promocodeId: promocodes[6]._id },
      { userId: users[2]._id, amount: 210, promocodeId: promocodes[8]._id },
      { userId: users[2]._id, amount: 95, promocodeId: promocodes[10]._id },
      { userId: users[2]._id, amount: 400, promocodeId: promocodes[11]._id },
      { userId: users[2]._id, amount: 65, promocodeId: promocodes[9]._id },
    ]);

    const promoUsages = await this.promoUsageModel.insertMany([
      // WELCOME10 — Alice, Bob
      {
        userId: users[0]._id,
        orderId: orders[1]._id,
        promocodeId: promocodes[0]._id,
        discountAmount: 9,
      },
      {
        userId: users[1]._id,
        orderId: orders[8]._id,
        promocodeId: promocodes[0]._id,
        discountAmount: 8,
      },
      // SUMMER25 — Bob
      {
        userId: users[1]._id,
        orderId: orders[7]._id,
        promocodeId: promocodes[1]._id,
        discountAmount: 37.5,
      },
      // VIP50 — Charlie
      {
        userId: users[2]._id,
        orderId: orders[13]._id,
        promocodeId: promocodes[2]._id,
        discountAmount: 25,
      },
      // NEWYEAR20 — Alice
      {
        userId: users[0]._id,
        orderId: orders[2]._id,
        promocodeId: promocodes[4]._id,
        discountAmount: 40,
      },
      // LOYAL30 — Alice, Bob
      {
        userId: users[0]._id,
        orderId: orders[4]._id,
        promocodeId: promocodes[5]._id,
        discountAmount: 96,
      },
      {
        userId: users[1]._id,
        orderId: orders[11]._id,
        promocodeId: promocodes[5]._id,
        discountAmount: 52.5,
      },
      // SPRING5 — Charlie
      {
        userId: users[2]._id,
        orderId: orders[15]._id,
        promocodeId: promocodes[6]._id,
        discountAmount: 6.5,
      },
      // HOLIDAY35 — Charlie
      {
        userId: users[2]._id,
        orderId: orders[16]._id,
        promocodeId: promocodes[8]._id,
        discountAmount: 73.5,
      },
      // FREESHIP — Alice, Bob, Charlie
      {
        userId: users[0]._id,
        orderId: orders[3]._id,
        promocodeId: promocodes[9]._id,
        discountAmount: 4.4,
      },
      {
        userId: users[1]._id,
        orderId: orders[9]._id,
        promocodeId: promocodes[9]._id,
        discountAmount: 8.8,
      },
      {
        userId: users[2]._id,
        orderId: orders[19]._id,
        promocodeId: promocodes[9]._id,
        discountAmount: 5.2,
      },
      // BIRTHDAY15 — Charlie
      {
        userId: users[2]._id,
        orderId: orders[17]._id,
        promocodeId: promocodes[10]._id,
        discountAmount: 14.25,
      },
      // REFER10 — Bob, Charlie
      {
        userId: users[1]._id,
        orderId: orders[10]._id,
        promocodeId: promocodes[11]._id,
        discountAmount: 25,
      },
      {
        userId: users[2]._id,
        orderId: orders[18]._id,
        promocodeId: promocodes[11]._id,
        discountAmount: 40,
      },
    ]);

    // Sync all seeded data to ClickHouse
    this.logger.log('Syncing seed data to ClickHouse...');

    for (const user of users) {
      await this.syncService.syncUser(user as UserDocument);
    }
    for (const promo of promocodes) {
      await this.syncService.syncPromocode(promo as PromocodeDocument);
    }

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    const promoMap = new Map(promocodes.map((p) => [p._id.toString(), p]));

    for (const order of orders) {
      const user = userMap.get(order.userId.toString())!;
      const promo = order.promocodeId
        ? promoMap.get(order.promocodeId.toString())
        : undefined;
      const usage = promoUsages.find(
        (pu) => pu.orderId.toString() === order._id.toString(),
      );
      await this.syncService.syncOrder(
        order as OrderDocument,
        user as UserDocument,
        usage?.discountAmount ?? 0,
        promo as PromocodeDocument | undefined,
      );
    }

    for (const usage of promoUsages) {
      const user = userMap.get(usage.userId.toString())!;
      const promo = promoMap.get(usage.promocodeId.toString())!;
      await this.syncService.syncPromoUsage(
        usage as PromoUsageDocument,
        user as UserDocument,
        promo as PromocodeDocument,
      );
    }

    this.logger.log(
      `Seed complete: ${users.length} users, ${promocodes.length} promocodes, ${orders.length} orders, ${promoUsages.length} promo usages`,
    );
    this.logger.log('All seeded data synced to ClickHouse');
    this.logger.log('For login use test@example.com and password123');
  }
}
