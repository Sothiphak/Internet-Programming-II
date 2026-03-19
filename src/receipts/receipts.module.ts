import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReceiptsService } from './receipts.service';
import { ReceiptsController } from './receipts.controller';
import { Receipt } from '../database/entities/receipts.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receipt]),
    ClientsModule.register([
      {
        name: 'RECEIPT_SERVICE',
        transport: Transport.RMQ, // <--- Changed 'type' to 'transport' here!
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'receipts_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
})
export class ReceiptsModule {}
