import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ClickHouseModule } from 'src/clickhouse/clickhouse.module';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  imports: [ClickHouseModule],
})
export class AnalyticsModule {}
