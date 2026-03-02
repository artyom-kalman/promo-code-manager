import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { LockService } from './lock.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>(
          'REDIS_URL',
          'redis://localhost:6379',
        );
        return new Redis(url);
      },
      inject: [ConfigService],
    },
    LockService,
  ],
  exports: ['REDIS_CLIENT', LockService],
})
export class RedisModule {}
