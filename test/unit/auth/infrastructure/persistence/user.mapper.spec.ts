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
      new User(
        prismaUser.id,
        prismaUser.name,
        prismaUser.email,
        prismaUser.passwordHash,
        prismaUser.role,
        prismaUser.created_at,
        prismaUser.updated_at,
        prismaUser.deleted_at,
      ),
    );
  });

  it('should map domain user to persistence', () => {
    const user = new User('user-id', 'John Doe', 'john@example.com', 'hashed-password', 'MECHANIC');

    expect(UserMapper.toPersistence(user)).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
    });
  });

  it('should map domain user to update persistence', () => {
    const deletedAt = new Date('2026-01-03T10:00:00.000Z');
    const user = new User(
      'user-id',
      'John Doe',
      'john@example.com',
      'hashed-password',
      'MECHANIC',
      undefined,
      undefined,
      deletedAt,
    );

    expect(UserMapper.toUpdatePersistence(user)).toEqual({
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      deleted_at: deletedAt,
    });
  });
});
