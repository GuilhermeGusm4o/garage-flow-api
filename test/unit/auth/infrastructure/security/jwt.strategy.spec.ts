import { JwtStrategy, type JwtPayload } from '@auth/infrastructure/security/jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    strategy = new JwtStrategy();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('should return the user data from the JWT payload', async () => {
    const payload: JwtPayload = {
      sub: 'user-id',
      role: 'ADMIN',
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      id: 'user-id',
      role: 'ADMIN',
    });
  });

  it('should throw when JWT_SECRET is not defined', () => {
    delete process.env.JWT_SECRET;

    expect(() => new JwtStrategy()).toThrow('JWT_SECRET is not defined');
  });
});
