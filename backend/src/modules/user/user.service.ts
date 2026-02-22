import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  createUser(userData: Partial<User>) {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  getUser(username: string) {
    return this.userRepository.findOne({
      where: { username },
      relations: ['tasks'],
    });
  }

  async updateUser(updateData: Partial<User>) {
    if (updateData.username) {
      await this.userRepository.update(
        { username: updateData.username },
        updateData,
      );
      return this.getUser(updateData.username);
    }
    return null;
  }

  deleteUser(username: string) {
    return this.userRepository.delete({ username });
  }
}
