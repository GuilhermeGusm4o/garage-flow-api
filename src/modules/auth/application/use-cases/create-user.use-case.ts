import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { User, UserRole } from '../../domain/entities/user.entity';

import { UserRepository } from '../../domain/repositories/user.repository';

import { BcryptPasswordHasher } from '../../infrastructure/security/bcrypt-password-hasher';

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: BcryptPasswordHasher,
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = new User(randomUUID(), input.name, input.email, passwordHash, input.role);

    return this.userRepository.create(user);
  }
}
