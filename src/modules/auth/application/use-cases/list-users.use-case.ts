import { Injectable } from '@nestjs/common';

import { User, UserRole } from '@auth/domain/entities/user.entity';
import { UserRepository } from '@auth/domain/repositories/user.repository';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(role?: UserRole): Promise<User[]> {
    const users = await this.userRepository.findAll(role);

    return users;
  }
}
