import { Module } from '@nestjs/common';
import { TasksController } from './task.controller';
import { TaskService } from './task.service';
import { UserModule } from '../user/user.module';
import { Task } from './task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), UserModule],
  controllers: [TasksController],
  providers: [TaskService],
  exports: [],
  // Add any other necessary configurations or modules
})
export class TaskModule {}
