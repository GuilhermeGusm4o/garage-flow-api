import { User, type UserRole } from '@auth/domain/entities/user.entity';

describe('User', () => {
  const userRole: UserRole = 'MECHANIC';

  const createUser = (overrides: Partial<User> = {}): User =>
    new User(
      overrides.id ?? 'user-id',
      overrides.name ?? 'John Doe',
      overrides.email ?? 'john@example.com',
      overrides.passwordHash ?? 'hashed-password',
      overrides.role ?? userRole,
      overrides.createdAt ?? new Date('2026-01-01T10:00:00.000Z'),
      overrides.updatedAt ?? new Date('2026-01-01T10:00:00.000Z'),
      overrides.deletedAt,
    );

  describe('constructor', () => {
    it('should create a user with the provided values', () => {
      const createdAt = new Date('2026-01-01T10:00:00.000Z');
      const updatedAt = new Date('2026-01-02T10:00:00.000Z');

      const user = new User(
        'user-id',
        'John Doe',
        'john@example.com',
        'hashed-password',
        'MECHANIC',
        createdAt,
        updatedAt,
      );

      expect(user.id).toBe('user-id');
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.passwordHash).toBe('hashed-password');
      expect(user.role).toBe('MECHANIC');
      expect(user.createdAt).toBe(createdAt);
      expect(user.updatedAt).toBe(updatedAt);
    });
  });

  describe('isDeleted', () => {
    it('should return false when deletedAt is undefined', () => {
      const user = createUser();

      expect(user.isDeleted()).toBe(false);
    });

    it('should return false when deletedAt is null', () => {
      const user = createUser({
        deletedAt: null,
      });

      expect(user.isDeleted()).toBe(false);
    });

    it('should return true when deletedAt has a date', () => {
      const deletedAt = new Date('2026-01-03T10:00:00.000Z');

      const user = createUser({
        deletedAt,
      });

      expect(user.isDeleted()).toBe(true);
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt', () => {
      const user = createUser();

      user.softDelete();

      expect(user.deletedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt', () => {
      const user = createUser();

      const before = new Date();
      user.softDelete();
      const after = new Date();

      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.updatedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.updatedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should mark the user as deleted', () => {
      const user = createUser();

      user.softDelete();

      expect(user.isDeleted()).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should return the user without the password hash', () => {
      const user = createUser();

      const result = user.toJSON();

      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should preserve the other user properties', () => {
      const user = createUser();

      const result = user.toJSON();

      expect(result).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
      });
    });
  });
});
