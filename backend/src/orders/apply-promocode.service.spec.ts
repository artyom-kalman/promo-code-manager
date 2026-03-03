import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ApplyPromocodeService } from './apply-promocode.service';
import { Order } from './schemas/order.schema';
import { PromocodesService } from '../promocodes/promocodes.service';
import { PromoUsagesService } from '../promo-usages/promo-usages.service';
import { LockService } from '../redis/lock.service';

describe('ApplyPromocodeService', () => {
  let service: ApplyPromocodeService;
  let orderModel: Record<string, jest.Mock>;
  let promocodesService: Record<string, jest.Mock>;
  let promoUsagesService: Record<string, jest.Mock>;
  let lockService: Record<string, jest.Mock>;

  let releaseOrderLock: jest.Mock;
  let releasePromoLock: jest.Mock;

  beforeEach(async () => {
    releaseOrderLock = jest.fn().mockResolvedValue(undefined);
    releasePromoLock = jest.fn().mockResolvedValue(undefined);

    orderModel = {
      findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
    };

    promocodesService = {
      findByCode: jest.fn(),
    };

    promoUsagesService = {
      countByPromocode: jest.fn(),
      countByPromocodeAndUser: jest.fn(),
      create: jest.fn(),
    };

    lockService = {
      acquire: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplyPromocodeService,
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: PromocodesService, useValue: promocodesService },
        { provide: PromoUsagesService, useValue: promoUsagesService },
        { provide: LockService, useValue: lockService },
      ],
    }).compile();

    service = module.get<ApplyPromocodeService>(ApplyPromocodeService);
  });

  const userId = 'user-1';
  const orderId = 'order-1';
  const dto = { code: 'SAVE10' };

  const mockOrder = {
    _id: orderId,
    userId: { toString: () => userId },
    amount: 1000,
    promocodeId: null,
  };

  const mockPromocode = {
    _id: 'promo-1',
    code: 'SAVE10',
    discountPercent: 10,
    maxUsages: 100,
    maxUsagesPerUser: 2,
    isActive: true,
    startDate: null,
    endDate: null,
  };

  function setupHappyPath() {
    lockService.acquire.mockResolvedValueOnce(releaseOrderLock);
    lockService.acquire.mockResolvedValueOnce(releasePromoLock);
    orderModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockOrder),
    });
    promocodesService.findByCode.mockResolvedValue(mockPromocode);
    promoUsagesService.countByPromocode.mockResolvedValue(0);
    promoUsagesService.countByPromocodeAndUser.mockResolvedValue(0);
    const updatedOrder = { ...mockOrder, promocodeId: 'promo-1' };
    orderModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updatedOrder),
    });
    promoUsagesService.create.mockResolvedValue({});
    return updatedOrder;
  }

  it('should apply promocode successfully (happy path)', async () => {
    const updatedOrder = setupHappyPath();

    const result = await service.apply(userId, orderId, dto);

    expect(result).toEqual(updatedOrder);
    expect(promoUsagesService.create).toHaveBeenCalledWith({
      userId,
      orderId,
      promocodeId: 'promo-1',
      discountAmount: 100,
    });
    expect(releaseOrderLock).toHaveBeenCalled();
    expect(releasePromoLock).toHaveBeenCalled();
  });

  it('should throw ConflictException when order lock fails', async () => {
    lockService.acquire.mockResolvedValue(null);

    await expect(service.apply(userId, orderId, dto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should throw NotFoundException when order not found', async () => {
    lockService.acquire.mockResolvedValueOnce(releaseOrderLock);
    orderModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.apply(userId, orderId, dto)).rejects.toThrow(
      NotFoundException,
    );
    expect(releaseOrderLock).toHaveBeenCalled();
  });

  it('should throw ForbiddenException when order belongs to different user', async () => {
    lockService.acquire.mockResolvedValueOnce(releaseOrderLock);
    orderModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...mockOrder,
        userId: { toString: () => 'other-user' },
      }),
    });

    await expect(service.apply(userId, orderId, dto)).rejects.toThrow(
      ForbiddenException,
    );
    expect(releaseOrderLock).toHaveBeenCalled();
  });

  it('should throw BadRequestException when promo already applied', async () => {
    lockService.acquire.mockResolvedValueOnce(releaseOrderLock);
    orderModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...mockOrder,
        promocodeId: 'existing-promo',
      }),
    });

    await expect(service.apply(userId, orderId, dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(releaseOrderLock).toHaveBeenCalled();
  });

  it('should throw NotFoundException when promocode not found', async () => {
    lockService.acquire.mockResolvedValueOnce(releaseOrderLock);
    orderModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockOrder),
    });
    promocodesService.findByCode.mockResolvedValue(null);

    await expect(service.apply(userId, orderId, dto)).rejects.toThrow(
      NotFoundException,
    );
    expect(releaseOrderLock).toHaveBeenCalled();
  });

  it('should throw BadRequestException when promocode is inactive', async () => {
    lockService.acquire.mockResolvedValueOnce(releaseOrderLock);
    orderModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockOrder),
    });
    promocodesService.findByCode.mockResolvedValue({
      ...mockPromocode,
      isActive: false,
    });

    await expect(service.apply(userId, orderId, dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(releaseOrderLock).toHaveBeenCalled();
  });

  it('should throw BadRequestException when promocode not yet started', async () => {
    lockService.acquire.mockResolvedValueOnce(releaseOrderLock);
    orderModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockOrder),
    });
    const futureDate = new Date(Date.now() + 86400000);
    promocodesService.findByCode.mockResolvedValue({
      ...mockPromocode,
      startDate: futureDate,
    });

    await expect(service.apply(userId, orderId, dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(releaseOrderLock).toHaveBeenCalled();
  });

  it('should throw BadRequestException when promocode expired', async () => {
    lockService.acquire.mockResolvedValueOnce(releaseOrderLock);
    orderModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockOrder),
    });
    const pastDate = new Date(Date.now() - 86400000);
    promocodesService.findByCode.mockResolvedValue({
      ...mockPromocode,
      endDate: pastDate,
    });

    await expect(service.apply(userId, orderId, dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(releaseOrderLock).toHaveBeenCalled();
  });

  it('should throw ConflictException when promo lock fails', async () => {
    lockService.acquire.mockResolvedValueOnce(releaseOrderLock);
    lockService.acquire.mockResolvedValueOnce(null);
    orderModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockOrder),
    });
    promocodesService.findByCode.mockResolvedValue(mockPromocode);

    await expect(service.apply(userId, orderId, dto)).rejects.toThrow(
      ConflictException,
    );
    expect(releaseOrderLock).toHaveBeenCalled();
  });

  it('should throw BadRequestException when global usage limit reached', async () => {
    lockService.acquire.mockResolvedValueOnce(releaseOrderLock);
    lockService.acquire.mockResolvedValueOnce(releasePromoLock);
    orderModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockOrder),
    });
    promocodesService.findByCode.mockResolvedValue(mockPromocode);
    promoUsagesService.countByPromocode.mockResolvedValue(100);

    await expect(service.apply(userId, orderId, dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(releaseOrderLock).toHaveBeenCalled();
    expect(releasePromoLock).toHaveBeenCalled();
  });

  it('should throw BadRequestException when per-user limit reached', async () => {
    lockService.acquire.mockResolvedValueOnce(releaseOrderLock);
    lockService.acquire.mockResolvedValueOnce(releasePromoLock);
    orderModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockOrder),
    });
    promocodesService.findByCode.mockResolvedValue(mockPromocode);
    promoUsagesService.countByPromocode.mockResolvedValue(0);
    promoUsagesService.countByPromocodeAndUser.mockResolvedValue(2);

    await expect(service.apply(userId, orderId, dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(releaseOrderLock).toHaveBeenCalled();
    expect(releasePromoLock).toHaveBeenCalled();
  });

  it('should release locks even when an error occurs', async () => {
    lockService.acquire.mockResolvedValueOnce(releaseOrderLock);
    lockService.acquire.mockResolvedValueOnce(releasePromoLock);
    orderModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockOrder),
    });
    promocodesService.findByCode.mockResolvedValue(mockPromocode);
    promoUsagesService.countByPromocode.mockRejectedValue(
      new Error('DB error'),
    );

    await expect(service.apply(userId, orderId, dto)).rejects.toThrow(
      'DB error',
    );
    expect(releaseOrderLock).toHaveBeenCalled();
    expect(releasePromoLock).toHaveBeenCalled();
  });
});
