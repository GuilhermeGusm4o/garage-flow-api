import { UserMapper } from '@auth/infrastructure/persistence/user.mapper';
import { User } from '@auth/domain/entities/user.entity';
import { type User as PrismaUser } from '@generated/prisma/client';

describe('UserMapper', () => {
  const prismaUser: PrismaUser = {
    id: 'user-id',
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: 'hashed-password',
    role: 'MECHANIC',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  it('should map Prisma user to domain user', () => {
    const result = UserMapper.toDomain(prismaUser);

    expect(result).toBeInstanceOf(User);
    expect(result).toEqual(
      User.create({
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email,
        passwordHash: prismaUser.passwordHash,
        role: prismaUser.role,
        createdAt: prismaUser.created_at,
        updatedAt: prismaUser.updated_at,
        deletedAt: prismaUser.deleted_at,
      }),
    );
  });

  it('should map domain user to persistence', () => {
    const now = new Date();
    const user = User.create({
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed-password',
      role: 'MECHANIC',
      createdAt: now,
      updatedAt: now,
    });

    expect(UserMapper.toPersistence(user)).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
    });
  });

  it('should map domain user to update persistence', () => {
    const now = new Date();
    const deletedAt = new Date('2026-01-03T10:00:00.000Z');
    const user = User.create({
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed-password',
      role: 'MECHANIC',
      createdAt: now,
      updatedAt: now,
      deletedAt,
    });

    expect(UserMapper.toUpdatePersistence(user)).toEqual({
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      deleted_at: deletedAt,
    });
  });
});
