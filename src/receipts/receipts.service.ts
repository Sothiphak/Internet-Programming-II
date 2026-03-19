import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices'; // <-- New import
import { Receipt } from '../database/entities/receipts.entity';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectRepository(Receipt)
    private readonly receiptRepo: Repository<Receipt>,
    @Inject('RECEIPT_SERVICE') private readonly rmqClient: ClientProxy, // <-- Inject RMQ Client
  ) {}

  async findAll() {
    return this.receiptRepo.find({ order: { issuedAt: 'DESC' } });
  }

  async findOne(receiptId: string) {
    const receipt = await this.receiptRepo.findOne({ where: { receiptId } });
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  async create(dto: CreateReceiptDto) {
    // 1. Create and save the receipt to Postgres
    const receipt = this.receiptRepo.create({
      issuedAt: new Date(dto.issuedAt),
      name: dto.name,
      price: dto.price,
    });
    const savedReceipt = await this.receiptRepo.save(receipt);

    // 2. Emit an event to RabbitMQ!
    this.rmqClient.emit('receipt_created', savedReceipt).subscribe();
    console.log(
      `[RabbitMQ] Emitted 'receipt_created' for ID: ${savedReceipt.receiptId}`,
    );

    return savedReceipt;
  }

  // ... keep update() and remove() exactly the same as before ...
  async update(receiptId: string, dto: UpdateReceiptDto) {
    const receipt = await this.findOne(receiptId);
    if (dto.issuedAt !== undefined) receipt.issuedAt = new Date(dto.issuedAt);
    if (dto.name !== undefined) receipt.name = dto.name;
    if (dto.price !== undefined) receipt.price = dto.price;
    return this.receiptRepo.save(receipt);
  }

  async remove(receiptId: string) {
    const receipt = await this.findOne(receiptId);
    await this.receiptRepo.remove(receipt);
    return { deleted: true, receiptId };
  }
}
