import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ReceiptsModule } from './receipts/receipts.module';
import { Receipt } from './database/entities/receipts.entity';

@Module({
  imports: [
    ConfigModule.forRoot(), // Loads your .env file
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // <-- UPDATE THIS
      password: 'password', // <-- UPDATE THIS
      database: 'practice2', // <-- UPDATE THIS (make sure this DB exists in PgAdmin/DBeaver!)
      entities: [Receipt],
      synchronize: true, // Auto-creates the DB table based on our Entity
    }),
    ReceiptsModule,
  ],
})
export class AppModule {}
