import { type User as PrismaUser } from '@generated/prisma/client';
import { User, type UserRole } from '@auth/domain/entities/user.entity';

export const UserMapper = {
  toDomain(raw: PrismaUser): User {
    return User.create({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      passwordHash: raw.passwordHash,
      role: raw.role as UserRole,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      deletedAt: raw.deleted_at,
    });
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
