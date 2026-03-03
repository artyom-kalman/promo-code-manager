import { Test, TestingModule } from '@nestjs/testing';
import { LockService } from './lock.service';

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid'),
}));

describe('LockService', () => {
  let service: LockService;
  let redis: Record<string, jest.Mock>;

  beforeEach(async () => {
    redis = {
      set: jest.fn(),
      eval: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LockService, { provide: 'REDIS_CLIENT', useValue: redis }],
    }).compile();

    service = module.get<LockService>(LockService);
  });

  it('should acquire lock and return release function', async () => {
    redis.set.mockResolvedValue('OK');

    const release = await service.acquire('lock:test', 5000);

    expect(release).toBeInstanceOf(Function);
    expect(redis.set).toHaveBeenCalledWith(
      'lock:test',
      'test-uuid',
      'EX',
      5,
      'NX',
    );
  });

  it('should return null when lock is contended', async () => {
    redis.set.mockResolvedValue(null);

    const release = await service.acquire('lock:test');

    expect(release).toBeNull();
  });

  it('should call eval with Lua script on release', async () => {
    redis.set.mockResolvedValue('OK');
    redis.eval.mockResolvedValue(1);

    const release = await service.acquire('lock:test');
    await release!();

    expect(redis.eval).toHaveBeenCalledWith(
      expect.stringContaining('redis.call("get", KEYS[1])'),
      1,
      'lock:test',
      'test-uuid',
    );
  });

  it('should use default ttl of 5000ms (5 seconds)', async () => {
    redis.set.mockResolvedValue('OK');

    await service.acquire('lock:test');

    expect(redis.set).toHaveBeenCalledWith(
      'lock:test',
      expect.any(String),
      'EX',
      5,
      'NX',
    );
  });

  it('should ceil ttl to seconds', async () => {
    redis.set.mockResolvedValue('OK');

    await service.acquire('lock:test', 1500);

    expect(redis.set).toHaveBeenCalledWith(
      'lock:test',
      expect.any(String),
      'EX',
      2,
      'NX',
    );
  });
});
