import { type Reflector } from '@nestjs/core';

import { RolesGuard } from '@auth/infrastructure/security/roles.guard';
import { ROLES_KEY } from '@auth/infrastructure/security/roles.decorator';
import { type ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector);
  });

  const createContext = (role?: string) => {
    const request = role ? { user: { id: 'user-id', role } } : {};

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const context = createContext('MECHANIC');

    expect(guard.canActivate(context)).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  });

  it('should allow access when user has the required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);

    const context = createContext('ADMIN');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user does not have the required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);

    const context = createContext('MECHANIC');

    expect(guard.canActivate(context)).toBe(false);
  });
});
