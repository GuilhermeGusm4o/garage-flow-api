import { User, type UserProps, type UserRole } from '@auth/domain/entities/user.entity';

describe('User', () => {
  const userRole: UserRole = 'MECHANIC';

  const createUser = (overrides: Partial<UserProps> = {}): User =>
    User.create({
      id: overrides.id ?? 'user-id',
      name: overrides.name ?? 'John Doe',
      email: overrides.email ?? 'john@example.com',
      passwordHash: overrides.passwordHash ?? 'hashed-password',
      role: overrides.role ?? userRole,
      createdAt: overrides.createdAt ?? new Date('2026-01-01T10:00:00.000Z'),
      updatedAt: overrides.updatedAt ?? new Date('2026-01-01T10:00:00.000Z'),
      deletedAt: overrides.deletedAt,
    });

  describe('create', () => {
    it('should create a user with the provided values', () => {
      const createdAt = new Date('2026-01-01T10:00:00.000Z');
      const updatedAt = new Date('2026-01-02T10:00:00.000Z');

      const user = User.create({
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        role: 'MECHANIC',
        createdAt,
        updatedAt,
      });

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

      expect(user.isDeleted).toBe(false);
    });

    it('should return false when deletedAt is null', () => {
      const user = createUser({
        deletedAt: null,
      });

      expect(user.isDeleted).toBe(false);
    });

    it('should return true when deletedAt has a date', () => {
      const deletedAt = new Date('2026-01-03T10:00:00.000Z');

      const user = createUser({
        deletedAt,
      });

      expect(user.isDeleted).toBe(true);
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
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should mark the user as deleted', () => {
      const user = createUser();

      user.softDelete();

      expect(user.isDeleted).toBe(true);
    });
  });

  describe('update', () => {
    it('should update the provided fields and touch updatedAt', () => {
      const user = createUser();

      user.update({ name: 'Jane Doe', email: 'jane@example.com', role: 'ADMIN' });

      expect(user.name).toBe('Jane Doe');
      expect(user.email).toBe('jane@example.com');
      expect(user.role).toBe('ADMIN');
    });

    it('should leave omitted fields unchanged', () => {
      const user = createUser();

      user.update({ name: 'Jane Doe' });

      expect(user.email).toBe('john@example.com');
      expect(user.passwordHash).toBe('hashed-password');
      expect(user.role).toBe('MECHANIC');
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
