import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  createTask(taskData: Partial<Task>) {
    const task = this.taskRepository.create(taskData);
    return this.taskRepository.save(task);
  }

  getTask(id: string) {
    // Convert the string ID to a number for the database query
    return this.taskRepository.findOne({
      where: { id: Number(id) },
      relations: ['user'],
    });
  }

  async updateTask(id: string, updateData: Partial<Task>) {
    await this.taskRepository.update(Number(id), updateData);
    return this.getTask(id);
  }

  deleteTask(id: string) {
    return this.taskRepository.delete(Number(id));
  }
  // Add this right below your createTask method
  getAllTasks() {
    return this.taskRepository.find({ relations: ['user'] });
  }
}
