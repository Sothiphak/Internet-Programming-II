import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptsService } from './receipts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Receipt } from '../database/entities/receipts.entity';
import { NotFoundException } from '@nestjs/common';

describe('ReceiptsService', () => {
  let service: ReceiptsService;

  // 1. Create a fake Postgres Repository
  const mockReceiptRepo = {
    findOne: jest.fn(),
  };

  // 2. Create a fake RabbitMQ Client
  const mockRmqClient = {
    emit: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
  };

  beforeEach(async () => {
    // 3. Provide the fakes to the NestJS testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptsService,
        {
          provide: getRepositoryToken(Receipt),
          useValue: mockReceiptRepo,
        },
        {
          provide: 'RECEIPT_SERVICE',
          useValue: mockRmqClient,
        },
      ],
    }).compile();

    service = module.get<ReceiptsService>(ReceiptsService);
  });

  // --- OUR ACTUAL TESTS ---

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a receipt if the ID exists', async () => {
      // Tell our fake database to return a fake receipt
      const expectedReceipt = { receiptId: '123', name: 'Test Receipt', price: 10 };
      mockReceiptRepo.findOne.mockResolvedValue(expectedReceipt);

      // Run the real service method
      const result = await service.findOne('123');
      
      // Check if it returned what we expect
      expect(result).toEqual(expectedReceipt);
    });

    it('should throw a NotFoundException if the ID does not exist', async () => {
      // Tell our fake database to return "null" (not found)
      mockReceiptRepo.findOne.mockResolvedValue(null);

      // Check if the service correctly throws the 404 error
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});