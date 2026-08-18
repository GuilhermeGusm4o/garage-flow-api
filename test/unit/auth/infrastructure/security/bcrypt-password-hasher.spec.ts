import { BcryptPasswordHasher } from '@auth/infrastructure/security/bcrypt-password-hasher';

describe('BcryptPasswordHasher', () => {
  const hasher = new BcryptPasswordHasher();

  it('should hash a password', async () => {
    const hash = await hasher.hash('password');

    expect(hash).not.toBe('password');
  });

  it('should return true when the password matches the hash', async () => {
    const hash = await hasher.hash('password');

    await expect(hasher.compare('password', hash)).resolves.toBe(true);
  });

  it('should return false when the password does not match the hash', async () => {
    const hash = await hasher.hash('password');

    await expect(hasher.compare('wrong-password', hash)).resolves.toBe(false);
  });
});
