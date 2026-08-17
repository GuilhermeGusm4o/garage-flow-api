import { type User as PrismaUser } from '@generated/prisma/client';
import { User, type UserRole } from '@auth/domain/entities/user.entity';

export const UserMapper = {
  toDomain(raw: PrismaUser): User {
    return new User(
      raw.id,
      raw.name,
      raw.email,
      raw.passwordHash,
      raw.role as UserRole,
      raw.created_at,
      raw.updated_at,
      raw.deleted_at,
    );
  },

  toPersistence(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
    };
  },

  toUpdatePersistence(user: User) {
    return {
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      deleted_at: user.deletedAt,
    };
  },
};
