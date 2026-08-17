import { Injectable, NotFoundException } from '@nestjs/common';

import { User, UserRole } from '@auth/domain/entities/user.entity';

import { UserRepository } from '@auth/domain/repositories/user.repository';

import { BcryptPasswordHasher } from '@auth/infrastructure/security/bcrypt-password-hasher';

interface UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: BcryptPasswordHasher,
  ) {}

  async execute(input: UpdateUserInput): Promise<User> {
    const user = await this.userRepository.findById(input.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (input.name !== undefined) {
      user.name = input.name;
    }

    if (input.email !== undefined) {
      user.email = input.email;
    }

    if (input.role !== undefined) {
      user.role = input.role;
    }

    if (input.password !== undefined) {
      user.passwordHash = await this.passwordHasher.hash(input.password);
    }

    user.updatedAt = new Date();

    return this.userRepository.update(user);
  }
}
