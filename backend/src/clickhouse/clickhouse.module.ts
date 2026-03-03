import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClickHouseService } from './clickhouse.service';
import { SyncService } from './sync.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ClickHouseService, SyncService],
  exports: [ClickHouseService, SyncService],
})
export class ClickHouseModule {}
