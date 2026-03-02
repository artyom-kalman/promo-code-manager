import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';

@Injectable()
export class LockService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async acquire(
    key: string,
    ttlMs: number = 5000,
  ): Promise<(() => Promise<void>) | null> {
    const token = randomUUID();
    const ttlSec = Math.ceil(ttlMs / 1000);

    const result = await this.redis.set(key, token, 'EX', ttlSec, 'NX');
    if (result !== 'OK') {
      return null;
    }

    const release = async () => {
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await this.redis.eval(script, 1, key, token);
    };

    return release;
  }
}
