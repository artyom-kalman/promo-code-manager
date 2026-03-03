import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('test-secret') },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('validate with type "access" — returns { userId, email }', () => {
    const result = strategy.validate({
      sub: 'u1',
      email: 'j@e.com',
      type: 'access',
    });

    expect(result).toEqual({ userId: 'u1', email: 'j@e.com' });
  });

  it('validate with type "refresh" — throws UnauthorizedException', () => {
    expect(() =>
      strategy.validate({ sub: 'u1', email: 'j@e.com', type: 'refresh' }),
    ).toThrow(UnauthorizedException);
  });

});
