import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClickHouseService } from './clickhouse.service';
import { SyncService } from './sync.service';
import { SyncListener } from './sync.listener';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ClickHouseService, SyncService, SyncListener],
  exports: [ClickHouseService, SyncService],
})
export class ClickHouseModule {}
