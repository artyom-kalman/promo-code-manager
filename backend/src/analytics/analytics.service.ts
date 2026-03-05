import { Injectable } from '@nestjs/common';
import { ClickHouseService } from '../clickhouse/clickhouse.service';
import { GetPromocodeAnalyticsDto } from './dto/get-promocode-analytics.dto';
import {
  PaginateResponse,
  PromocodeAnalyticsRow,
} from './interfaces/promocode-analytics.interface';

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
  constructor(private readonly clickhouseService: ClickHouseService) {}

  async getPromocodeAnalytics(
    dto: GetPromocodeAnalyticsDto,
  ): Promise<PaginateResponse<PromocodeAnalyticsRow>> {
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
        FROM promocodes FINAL AS p
        LEFT JOIN (
          SELECT
            pu.promocode_id,
            count(*)                AS total_usages,
            uniqExact(pu.user_id)   AS unique_users,
            sum(o.amount)           AS total_revenue,
            sum(pu.discount_amount) AS total_discount_given
          FROM promo_usages AS pu
          INNER JOIN orders FINAL AS o ON o.id = pu.order_id
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
        FROM promocodes FINAL AS p
        ${whereStr}`,
        params,
      ),
    ]);

    return {
      data: rows.map((row) => this.mapRow(row)),
      total: Number(countResult[0]?.total ?? 0),
      page: dto.page,
      pageSize: dto.pageSize,
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
}
