import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, ClickHouseClient } from '@clickhouse/client';

@Injectable()
export class ClickHouseService implements OnModuleInit {
  private readonly logger = new Logger(ClickHouseService.name);
  private readonly client: ClickHouseClient;

  constructor(private readonly configService: ConfigService) {
    this.client = createClient({
      url: this.configService.get<string>(
        'CLICKHOUSE_URL',
        'http://localhost:8123',
      ),
    });
  }

  async onModuleInit() {
    await this.createTables();
  }

  private async createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id String,
        name String,
        email String,
        phone String,
        is_active UInt8,
        created_at DateTime,
        updated_at DateTime
      ) ENGINE = ReplacingMergeTree(updated_at)
      ORDER BY id`,

      `CREATE TABLE IF NOT EXISTS promocodes (
        id String,
        code String,
        discount_percent Float64,
        max_usages UInt32,
        max_usages_per_user UInt32,
        start_date Nullable(DateTime),
        end_date Nullable(DateTime),
        is_active UInt8,
        created_at DateTime,
        updated_at DateTime
      ) ENGINE = ReplacingMergeTree(updated_at)
      ORDER BY id`,

      `CREATE TABLE IF NOT EXISTS orders (
        id String,
        user_id String,
        user_name String,
        user_email String,
        amount Float64,
        promocode_id Nullable(String),
        promocode_code Nullable(String),
        discount_amount Float64 DEFAULT 0,
        created_at DateTime,
        updated_at DateTime
      ) ENGINE = ReplacingMergeTree(updated_at)
      ORDER BY id`,

      `CREATE TABLE IF NOT EXISTS promo_usages (
        id String,
        user_id String,
        user_name String,
        user_email String,
        order_id String,
        promocode_id String,
        promocode_code String,
        discount_amount Float64,
        created_at DateTime
      ) ENGINE = MergeTree()
      ORDER BY (created_at, id)`,
    ];

    for (const query of tables) {
      await this.client.command({ query });
    }

    this.logger.log('ClickHouse tables created');
  }

  async query<T>(query: string, query_params?: Record<string, unknown>) {
    const result = await this.client.query({
      query,
      query_params,
      format: 'JSONEachRow',
    });
    return result.json<T>();
  }

  async insert<T>(table: string, values: T[]) {
    await this.client.insert({
      table,
      values,
      format: 'JSONEachRow',
    });
  }
}
