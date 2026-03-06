import { Injectable } from '@nestjs/common';
import { ClickHouseService } from '../clickhouse/clickhouse.service';
import { GetPromocodeAnalyticsDto } from './dto/get-promocode-analytics.dto';
import { GetPromoUsageAnalyticsDto } from './dto/get-promo-usage-analytics.dto';
import { GetUserAnalyticsDto } from './dto/get-user-analytics.dto';
import {
  PaginateResponse,
  PromoUsageAnalyticsRow,
  PromocodeAnalyticsRow,
  UserAnalyticsRow,
} from './interfaces/promocode-analytics.interface';
import { CacheService } from '../redis/cache.service';

interface RawPromocodeRow {
  id: string;
  code: string;
  discount_percent: string;
  max_usages: string;
  max_usages_per_user: string;
  start_date: string | null;
  end_date: string | null;
  is_active: string;
  created_at: string;
  total_usages: string;
  unique_users: string;
  total_revenue: string;
  total_discount_given: string;
}

interface RawPromoUsageRow {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  order_id: string;
  promocode_id: string;
  promocode_code: string;
  discount_amount: string;
  created_at: string;
}

interface RawUserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: string;
  created_at: string;
  total_orders: string;
  total_spent: string;
  total_discount: string;
  promocodes_used: string;
}

const USER_SORT_COLUMN_MAP: Record<string, string> = {
  name: 'u.name',
  email: 'u.email',
  is_active: 'u.is_active',
  created_at: 'u.created_at',
  total_orders: 'total_orders',
  total_spent: 'total_spent',
  promocodes_used: 'promocodes_used',
};

const PROMO_USAGE_SORT_COLUMN_MAP: Record<string, string> = {
  created_at: 'created_at',
  discount_amount: 'discount_amount',
  user_name: 'user_name',
  promocode_code: 'promocode_code',
};

const SORT_COLUMN_MAP: Record<string, string> = {
  code: 'p.code',
  discount_percent: 'p.discount_percent',
  is_active: 'p.is_active',
  created_at: 'p.created_at',
  total_usages: 'total_usages',
  unique_users: 'unique_users',
  total_revenue: 'total_revenue',
  total_discount_given: 'total_discount_given',
};

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly clickhouseService: ClickHouseService,
    private readonly cacheService: CacheService,
  ) {}

  async getPromocodeAnalytics(
    dto: GetPromocodeAnalyticsDto,
  ): Promise<PaginateResponse<PromocodeAnalyticsRow>> {
    const cacheKey = `analytics:promocodes:${this.buildCacheHash(dto)}`;

    const cached =
      await this.cacheService.get<PaginateResponse<PromocodeAnalyticsRow>>(
        cacheKey,
      );
    if (cached) {
      return cached;
    }

    const { whereClauses, usageWhereClauses, params } =
      this.buildFilterClauses(dto);

    const sortColumn = SORT_COLUMN_MAP[dto.sortBy] ?? 'p.created_at';
    const sortDirection = dto.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (dto.page - 1) * dto.pageSize;

    params.limit = dto.pageSize;
    params.offset = offset;

    const usageWhereStr = usageWhereClauses.length
      ? 'WHERE ' + usageWhereClauses.join(' AND ')
      : '';
    const whereStr = whereClauses.length
      ? 'WHERE ' + whereClauses.join(' AND ')
      : '';

    const [rows, countResult] = await Promise.all([
      this.clickhouseService.query<RawPromocodeRow>(
        `SELECT
          p.id,
          p.code,
          p.discount_percent,
          p.max_usages,
          p.max_usages_per_user,
          p.start_date,
          p.end_date,
          p.is_active,
          p.created_at,
          COALESCE(u.total_usages, 0)         AS total_usages,
          COALESCE(u.unique_users, 0)         AS unique_users,
          COALESCE(u.total_revenue, 0)        AS total_revenue,
          COALESCE(u.total_discount_given, 0) AS total_discount_given
        FROM promocodes AS p FINAL
        LEFT JOIN (
          SELECT
            pu.promocode_id,
            count(*)                AS total_usages,
            uniqExact(pu.user_id)   AS unique_users,
            sum(o.amount)           AS total_revenue,
            sum(pu.discount_amount) AS total_discount_given
          FROM promo_usages AS pu
          INNER JOIN orders AS o FINAL ON o.id = pu.order_id
          ${usageWhereStr}
          GROUP BY pu.promocode_id
        ) AS u ON u.promocode_id = p.id
        ${whereStr}
        ORDER BY ${sortColumn} ${sortDirection}
        LIMIT {limit:UInt32}
        OFFSET {offset:UInt32}`,
        params,
      ),
      this.clickhouseService.query<{ total: string }>(
        `SELECT count(*) AS total
        FROM promocodes AS p FINAL
        ${whereStr}`,
        params,
      ),
    ]);

    const result = {
      data: rows.map((row) => this.mapRow(row)),
      total: Number(countResult[0]?.total ?? 0),
      page: dto.page,
      pageSize: dto.pageSize,
    };

    await this.cacheService.set(cacheKey, result);

    return result;
  }

  async getUserAnalytics(
    dto: GetUserAnalyticsDto,
  ): Promise<PaginateResponse<UserAnalyticsRow>> {
    const cacheKey = `analytics:users:${this.buildCacheHash(dto)}`;

    const cached =
      await this.cacheService.get<PaginateResponse<UserAnalyticsRow>>(cacheKey);
    if (cached) {
      return cached;
    }

    const { whereClauses, orderWhereClauses, params } =
      this.buildUserFilterClauses(dto);

    const sortColumn = USER_SORT_COLUMN_MAP[dto.sortBy] ?? 'u.created_at';
    const sortDirection = dto.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (dto.page - 1) * dto.pageSize;

    params.limit = dto.pageSize;
    params.offset = offset;

    const orderWhereStr = orderWhereClauses.length
      ? 'WHERE ' + orderWhereClauses.join(' AND ')
      : '';
    const whereStr = whereClauses.length
      ? 'WHERE ' + whereClauses.join(' AND ')
      : '';

    const [rows, countResult] = await Promise.all([
      this.clickhouseService.query<RawUserRow>(
        `SELECT
          u.id,
          u.name,
          u.email,
          u.phone,
          u.is_active,
          u.created_at,
          COALESCE(o.total_orders, 0)    AS total_orders,
          COALESCE(o.total_spent, 0)     AS total_spent,
          COALESCE(o.total_discount, 0)  AS total_discount,
          COALESCE(o.promocodes_used, 0) AS promocodes_used
        FROM users AS u FINAL
        LEFT JOIN (
          SELECT
            ord.user_id,
            count(*)                    AS total_orders,
            sum(ord.amount)             AS total_spent,
            sum(ord.discount_amount)    AS total_discount,
            uniqExact(ord.promocode_id) AS promocodes_used
          FROM orders AS ord FINAL
          ${orderWhereStr}
          GROUP BY ord.user_id
        ) AS o ON o.user_id = u.id
        ${whereStr}
        ORDER BY ${sortColumn} ${sortDirection}
        LIMIT {limit:UInt32}
        OFFSET {offset:UInt32}`,
        params,
      ),
      this.clickhouseService.query<{ total: string }>(
        `SELECT count(*) AS total
        FROM users AS u FINAL
        ${whereStr}`,
        params,
      ),
    ]);

    const result = {
      data: rows.map((row) => this.mapUserRow(row)),
      total: Number(countResult[0]?.total ?? 0),
      page: dto.page,
      pageSize: dto.pageSize,
    };

    await this.cacheService.set(cacheKey, result);

    return result;
  }

  async getPromoUsageAnalytics(
    dto: GetPromoUsageAnalyticsDto,
  ): Promise<PaginateResponse<PromoUsageAnalyticsRow>> {
    const cacheKey = `analytics:promo-usages:${this.buildCacheHash(dto)}`;

    const cached =
      await this.cacheService.get<PaginateResponse<PromoUsageAnalyticsRow>>(
        cacheKey,
      );
    if (cached) {
      return cached;
    }

    const { whereClauses, params } = this.buildPromoUsageFilterClauses(dto);

    const sortColumn = PROMO_USAGE_SORT_COLUMN_MAP[dto.sortBy] ?? 'created_at';
    const sortDirection = dto.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (dto.page - 1) * dto.pageSize;

    params.limit = dto.pageSize;
    params.offset = offset;

    const whereStr = whereClauses.length
      ? 'WHERE ' + whereClauses.join(' AND ')
      : '';

    const [rows, countResult] = await Promise.all([
      this.clickhouseService.query<RawPromoUsageRow>(
        `SELECT
          id,
          user_id,
          user_name,
          user_email,
          order_id,
          promocode_id,
          promocode_code,
          discount_amount,
          created_at
        FROM promo_usages
        ${whereStr}
        ORDER BY ${sortColumn} ${sortDirection}
        LIMIT {limit:UInt32}
        OFFSET {offset:UInt32}`,
        params,
      ),
      this.clickhouseService.query<{ total: string }>(
        `SELECT count(*) AS total
        FROM promo_usages
        ${whereStr}`,
        params,
      ),
    ]);

    const result = {
      data: rows.map((row) => this.mapPromoUsageRow(row)),
      total: Number(countResult[0]?.total ?? 0),
      page: dto.page,
      pageSize: dto.pageSize,
    };

    await this.cacheService.set(cacheKey, result);

    return result;
  }

  private buildPromoUsageFilterClauses(dto: GetPromoUsageAnalyticsDto) {
    const whereClauses: string[] = [];
    const params: Record<string, unknown> = {};

    if (dto.dateFrom) {
      whereClauses.push('created_at >= {dateFrom:DateTime}');
      params.dateFrom = dto.dateFrom;
    }
    if (dto.dateTo) {
      whereClauses.push('created_at <= {dateTo:DateTime}');
      params.dateTo = dto.dateTo;
    }
    if (dto.userId) {
      whereClauses.push('user_id = {userId:String}');
      params.userId = dto.userId;
    }
    if (dto.promocodeId) {
      whereClauses.push('promocode_id = {promocodeId:String}');
      params.promocodeId = dto.promocodeId;
    }
    if (dto.promocodeCode) {
      whereClauses.push(
        'positionCaseInsensitive(promocode_code, {promocodeCode:String}) > 0',
      );
      params.promocodeCode = dto.promocodeCode;
    }
    if (dto.userName) {
      whereClauses.push(
        'positionCaseInsensitive(user_name, {userName:String}) > 0',
      );
      params.userName = dto.userName;
    }
    if (dto.userEmail) {
      whereClauses.push(
        'positionCaseInsensitive(user_email, {userEmail:String}) > 0',
      );
      params.userEmail = dto.userEmail;
    }

    return { whereClauses, params };
  }

  private mapPromoUsageRow(row: RawPromoUsageRow): PromoUsageAnalyticsRow {
    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      orderId: row.order_id,
      promocodeId: row.promocode_id,
      promocodeCode: row.promocode_code,
      discountAmount: Number(row.discount_amount),
      createdAt: row.created_at,
    };
  }

  private buildUserFilterClauses(dto: GetUserAnalyticsDto) {
    const whereClauses: string[] = [];
    const orderWhereClauses: string[] = [];
    const params: Record<string, unknown> = {};

    if (dto.dateFrom) {
      orderWhereClauses.push('ord.created_at >= {dateFrom:DateTime}');
      params.dateFrom = dto.dateFrom;
    }
    if (dto.dateTo) {
      orderWhereClauses.push('ord.created_at <= {dateTo:DateTime}');
      params.dateTo = dto.dateTo;
    }

    if (dto.name) {
      whereClauses.push('positionCaseInsensitive(u.name, {name:String}) > 0');
      params.name = dto.name;
    }
    if (dto.email) {
      whereClauses.push('positionCaseInsensitive(u.email, {email:String}) > 0');
      params.email = dto.email;
    }
    if (dto.isActive !== undefined) {
      whereClauses.push('u.is_active = {isActive:UInt8}');
      params.isActive = dto.isActive;
    }

    return { whereClauses, orderWhereClauses, params };
  }

  private mapUserRow(row: RawUserRow): UserAnalyticsRow {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      isActive: Boolean(Number(row.is_active)),
      createdAt: row.created_at,
      totalOrders: Number(row.total_orders),
      totalSpent: Number(row.total_spent),
      totalDiscount: Number(row.total_discount),
      promocodesUsed: Number(row.promocodes_used),
    };
  }

  private buildFilterClauses(dto: GetPromocodeAnalyticsDto) {
    const whereClauses: string[] = [];
    const usageWhereClauses: string[] = [];
    const params: Record<string, unknown> = {};

    if (dto.dateFrom) {
      usageWhereClauses.push('pu.created_at >= {dateFrom:DateTime}');
      params.dateFrom = dto.dateFrom;
    }
    if (dto.dateTo) {
      usageWhereClauses.push('pu.created_at <= {dateTo:DateTime}');
      params.dateTo = dto.dateTo;
    }

    if (dto.code) {
      whereClauses.push('positionCaseInsensitive(p.code, {code:String}) > 0');
      params.code = dto.code;
    }
    if (dto.isActive !== undefined) {
      whereClauses.push('p.is_active = {isActive:UInt8}');
      params.isActive = dto.isActive;
    }
    if (dto.discountPercentMin !== undefined) {
      whereClauses.push('p.discount_percent >= {discountPercentMin:Float64}');
      params.discountPercentMin = dto.discountPercentMin;
    }
    if (dto.discountPercentMax !== undefined) {
      whereClauses.push('p.discount_percent <= {discountPercentMax:Float64}');
      params.discountPercentMax = dto.discountPercentMax;
    }

    return { whereClauses, usageWhereClauses, params };
  }

  private mapRow(row: RawPromocodeRow): PromocodeAnalyticsRow {
    return {
      id: row.id,
      code: row.code,
      discountPercent: Number(row.discount_percent),
      maxUsages: Number(row.max_usages),
      maxUsagesPerUser: Number(row.max_usages_per_user),
      startDate: row.start_date || null,
      endDate: row.end_date || null,
      isActive: Boolean(Number(row.is_active)),
      createdAt: row.created_at,
      totalUsages: Number(row.total_usages),
      uniqueUsers: Number(row.unique_users),
      totalRevenue: Number(row.total_revenue),
      totalDiscountGiven: Number(row.total_discount_given),
    };
  }

  private buildCacheHash(dto: object): string {
    const record = dto as Record<string, unknown>;
    const sorted = Object.keys(record)
      .sort()
      .reduce(
        (acc, key) => {
          if (record[key] !== undefined) {
            acc[key] = record[key];
          }
          return acc;
        },
        {} as Record<string, unknown>,
      );
    return Buffer.from(JSON.stringify(sorted)).toString('base64url');
  }
}
