import { Injectable } from '@nestjs/common';

import { User } from '@auth/domain/entities/user.entity';
import { UserRepository } from '@auth/domain/repositories/user.repository';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<User[]> {
    const users = await this.userRepository.findAll();

    return users;
  }
}
