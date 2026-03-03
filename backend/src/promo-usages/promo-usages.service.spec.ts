import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PromoUsagesService } from './promo-usages.service';
import { PromoUsage } from './schemas/promo-usage.schema';

describe('PromoUsagesService', () => {
  let service: PromoUsagesService;
  let model: Record<string, jest.Mock>;

  beforeEach(async () => {
    model = {
      create: jest.fn(),
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn() }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromoUsagesService,
        { provide: getModelToken(PromoUsage.name), useValue: model },
      ],
    }).compile();

    service = module.get<PromoUsagesService>(PromoUsagesService);
  });

  it('should create a promo usage record', async () => {
    const data = {
      userId: 'user-1',
      orderId: 'order-1',
      promocodeId: 'promo-1',
      discountAmount: 50,
    };
    const expected = { ...data, _id: 'usage-1' };
    model.create.mockResolvedValue(expected);

    const result = await service.create(data);

    expect(result).toEqual(expected);
    expect(model.create).toHaveBeenCalledWith(data);
  });

  it('should count usages by promocode', async () => {
    const exec = jest.fn().mockResolvedValue(5);
    model.countDocuments.mockReturnValue({ exec });

    const result = await service.countByPromocode('promo-1');

    expect(result).toBe(5);
    expect(model.countDocuments).toHaveBeenCalledWith({
      promocodeId: 'promo-1',
    });
  });

  it('should count usages by promocode and user', async () => {
    const exec = jest.fn().mockResolvedValue(2);
    model.countDocuments.mockReturnValue({ exec });

    const result = await service.countByPromocodeAndUser('promo-1', 'user-1');

    expect(result).toBe(2);
    expect(model.countDocuments).toHaveBeenCalledWith({
      promocodeId: 'promo-1',
      userId: 'user-1',
    });
  });
});
