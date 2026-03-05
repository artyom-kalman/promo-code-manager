import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { ClickHouseService } from '../clickhouse/clickhouse.service';
import { GetPromocodeAnalyticsDto } from './dto/get-promocode-analytics.dto';
import { GetUserAnalyticsDto } from './dto/get-user-analytics.dto';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let clickhouse: { query: jest.Mock };

  beforeEach(async () => {
    clickhouse = { query: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: ClickHouseService, useValue: clickhouse },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated results with defaults', async () => {
    clickhouse.query
      .mockResolvedValueOnce([]) // data query
      .mockResolvedValueOnce([{ total: '0' }]); // count query

    const dto = Object.assign(new GetPromocodeAnalyticsDto(), {
      page: 1,
      pageSize: 20,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });

    const result = await service.getPromocodeAnalytics(dto);

    expect(result).toEqual({
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
    expect(clickhouse.query).toHaveBeenCalledTimes(2);
  });

  it('should map raw ClickHouse rows to typed response', async () => {
    const rawRow = {
      id: '123',
      code: 'SUMMER2024',
      discount_percent: '15',
      max_usages: '100',
      max_usages_per_user: '1',
      start_date: '2024-01-01 00:00:00',
      end_date: null,
      is_active: '1',
      created_at: '2024-01-01 00:00:00',
      total_usages: '5',
      unique_users: '3',
      total_revenue: '500.50',
      total_discount_given: '75.08',
    };

    clickhouse.query
      .mockResolvedValueOnce([rawRow])
      .mockResolvedValueOnce([{ total: '1' }]);

    const dto = Object.assign(new GetPromocodeAnalyticsDto(), {
      page: 1,
      pageSize: 20,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });

    const result = await service.getPromocodeAnalytics(dto);

    expect(result.data[0]).toEqual({
      id: '123',
      code: 'SUMMER2024',
      discountPercent: 15,
      maxUsages: 100,
      maxUsagesPerUser: 1,
      startDate: '2024-01-01 00:00:00',
      endDate: null,
      isActive: true,
      createdAt: '2024-01-01 00:00:00',
      totalUsages: 5,
      uniqueUsers: 3,
      totalRevenue: 500.5,
      totalDiscountGiven: 75.08,
    });
    expect(result.total).toBe(1);
  });

  it('should include date filters in usage subquery params', async () => {
    clickhouse.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: '0' }]);

    const dto = Object.assign(new GetPromocodeAnalyticsDto(), {
      page: 1,
      pageSize: 20,
      sortBy: 'created_at',
      sortOrder: 'desc',
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
    });

    await service.getPromocodeAnalytics(dto);

    type QueryCall = [string, Record<string, unknown>];
    const calls = clickhouse.query.mock.calls as QueryCall[];

    const dataQuery = calls[0][0];
    expect(dataQuery).toContain('pu.created_at >= {dateFrom:DateTime}');
    expect(dataQuery).toContain('pu.created_at <= {dateTo:DateTime}');

    const params = calls[0][1];
    expect(params.dateFrom).toBe('2024-01-01');
    expect(params.dateTo).toBe('2024-12-31');
  });

  it('should include column filters in WHERE clause', async () => {
    clickhouse.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: '0' }]);

    const dto = Object.assign(new GetPromocodeAnalyticsDto(), {
      page: 1,
      pageSize: 20,
      sortBy: 'created_at',
      sortOrder: 'desc',
      code: 'SUMMER',
      isActive: 1,
    });

    await service.getPromocodeAnalytics(dto);

    type QueryCall = [string, Record<string, unknown>];
    const calls = clickhouse.query.mock.calls as QueryCall[];

    const dataQuery = calls[0][0];
    expect(dataQuery).toContain(
      'positionCaseInsensitive(p.code, {code:String})',
    );
    expect(dataQuery).toContain('p.is_active = {isActive:UInt8}');

    const params = calls[0][1];
    expect(params.code).toBe('SUMMER');
    expect(params.isActive).toBe(1);
  });

  describe('getUserAnalytics', () => {
    it('should return paginated results with defaults', async () => {
      clickhouse.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: '0' }]);

      const dto = Object.assign(new GetUserAnalyticsDto(), {
        page: 1,
        pageSize: 20,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      const result = await service.getUserAnalytics(dto);

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
      });
      expect(clickhouse.query).toHaveBeenCalledTimes(2);
    });

    it('should map raw ClickHouse rows to typed response', async () => {
      const rawRow = {
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        is_active: '1',
        created_at: '2024-01-01 00:00:00',
        total_orders: '10',
        total_spent: '1500.50',
        total_discount: '200.25',
        promocodes_used: '3',
      };

      clickhouse.query
        .mockResolvedValueOnce([rawRow])
        .mockResolvedValueOnce([{ total: '1' }]);

      const dto = Object.assign(new GetUserAnalyticsDto(), {
        page: 1,
        pageSize: 20,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      const result = await service.getUserAnalytics(dto);

      expect(result.data[0]).toEqual({
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        isActive: true,
        createdAt: '2024-01-01 00:00:00',
        totalOrders: 10,
        totalSpent: 1500.5,
        totalDiscount: 200.25,
        promocodesUsed: 3,
      });
      expect(result.total).toBe(1);
    });

    it('should include date filters in subquery params', async () => {
      clickhouse.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: '0' }]);

      const dto = Object.assign(new GetUserAnalyticsDto(), {
        page: 1,
        pageSize: 20,
        sortBy: 'created_at',
        sortOrder: 'desc',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      });

      await service.getUserAnalytics(dto);

      type QueryCall = [string, Record<string, unknown>];
      const calls = clickhouse.query.mock.calls as QueryCall[];

      const dataQuery = calls[0][0];
      expect(dataQuery).toContain('ord.created_at >= {dateFrom:DateTime}');
      expect(dataQuery).toContain('ord.created_at <= {dateTo:DateTime}');

      const params = calls[0][1];
      expect(params.dateFrom).toBe('2024-01-01');
      expect(params.dateTo).toBe('2024-12-31');
    });

    it('should include column filters in WHERE clause', async () => {
      clickhouse.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: '0' }]);

      const dto = Object.assign(new GetUserAnalyticsDto(), {
        page: 1,
        pageSize: 20,
        sortBy: 'created_at',
        sortOrder: 'desc',
        name: 'John',
        email: 'john',
        isActive: 1,
      });

      await service.getUserAnalytics(dto);

      type QueryCall = [string, Record<string, unknown>];
      const calls = clickhouse.query.mock.calls as QueryCall[];

      const dataQuery = calls[0][0];
      expect(dataQuery).toContain(
        'positionCaseInsensitive(u.name, {name:String})',
      );
      expect(dataQuery).toContain(
        'positionCaseInsensitive(u.email, {email:String})',
      );
      expect(dataQuery).toContain('u.is_active = {isActive:UInt8}');

      const params = calls[0][1];
      expect(params.name).toBe('John');
      expect(params.email).toBe('john');
      expect(params.isActive).toBe(1);
    });
  });
});
