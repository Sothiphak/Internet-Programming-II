import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptsService } from './receipts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Receipt } from '../database/entities/receipts.entity';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

describe('ReceiptsService', () => {
  let service: ReceiptsService;

  const mockReceiptRepo = {
    findOne: jest.fn(),
  };

  const mockNotificationsService = {
    notify: jest.fn().mockReturnValue({ ok: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptsService,
        {
          provide: getRepositoryToken(Receipt),
          useValue: mockReceiptRepo,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<ReceiptsService>(ReceiptsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a receipt if the ID exists', async () => {
      const expectedReceipt = {
        receiptId: '123',
        name: 'Test Receipt',
        price: 10,
      };
      mockReceiptRepo.findOne.mockResolvedValue(expectedReceipt);

      const result = await service.findOne('123');
      expect(result).toEqual(expectedReceipt);
    });

    it('should throw a NotFoundException if the ID does not exist', async () => {
      mockReceiptRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});
