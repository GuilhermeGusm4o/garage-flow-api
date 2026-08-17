import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infra/database/prisma/prisma.service';

import { User } from '@auth/domain/entities/user.entity';
import { UserRepository } from '@auth/domain/repositories/user.repository';

import { UserMapper } from './user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        deleted_at: null,
      },
    });

    return users.map(UserMapper.toDomain);
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findFirst({
      where: {
        email,
        deleted_at: null,
      },
    });

    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findActiveByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findFirst({
      where: {
        email,
        deleted_at: null,
      },
    });

    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    return raw ? UserMapper.toDomain(raw) : null;
  }

  async create(user: User): Promise<User> {
    const raw = await this.prisma.user.create({
      data: UserMapper.toPersistence(user),
    });

    return UserMapper.toDomain(raw);
  }

  async update(user: User): Promise<User> {
    const raw = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: UserMapper.toUpdatePersistence(user),
    });

    return UserMapper.toDomain(raw);
  }
}
