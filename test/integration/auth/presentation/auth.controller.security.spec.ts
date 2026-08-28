import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { type UUID } from 'crypto';

import { AuthController } from '@auth/presentation/auth.controller';
import { CreateUserUseCase } from '@auth/application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '@auth/application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '@auth/application/use-cases/delete-user.use-case';
import { LoginUseCase } from '@auth/application/use-cases/login-user.use-case';
import { ListUsersUseCase } from '@auth/application/use-cases/list-users.use-case';
import { GetUserByEmailUseCase } from '@auth/application/use-cases/get-user-by-email.use-case';
import { User, type UserRole } from '@auth/domain/entities/user.entity';
import { JwtAuthGuard } from '@auth/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/security/roles.guard';
import { JwtStrategy } from '@auth/infrastructure/security/jwt.strategy';

const JWT_SECRET = 'test-secret';
const mockId = '123e4567-e89b-12d3-a456-426614174000' as UUID;

const ALL_ROLES: UserRole[] = ['ADMIN', 'MECHANIC', 'SERVICE_ADVISOR', 'STOCK_CLERK'];

const makeUser = (): User =>
  new User(mockId, 'John Doe', 'john@example.com', 'hash', 'ADMIN', new Date(), new Date(), null);

type Endpoint = {
  description: string;
  method: 'get' | 'post' | 'patch' | 'delete';
  path: string;
  body?: Record<string, unknown>;
  allowedRoles: UserRole[];
  successStatus: number;
};

const endpoints: Endpoint[] = [
  {
    description: 'POST /auth/users',
    method: 'post',
    path: '/auth/users',
    body: { name: 'John Doe', email: 'john@example.com', password: 'Password123', role: 'ADMIN' },
    allowedRoles: ['ADMIN'],
    successStatus: 201,
  },
  {
    description: 'GET /auth/users',
    method: 'get',
    path: '/auth/users',
    allowedRoles: ALL_ROLES,
    successStatus: 200,
  },
  {
    description: 'GET /auth/users/:email',
    method: 'get',
    path: '/auth/users/john@example.com',
    allowedRoles: ALL_ROLES,
    successStatus: 200,
  },
  {
    description: 'PATCH /auth/users/:id',
    method: 'patch',
    path: `/auth/users/${mockId}`,
    body: { name: 'Jane Doe' },
    allowedRoles: ['ADMIN'],
    successStatus: 200,
  },
  {
    description: 'DELETE /auth/users/:id',
    method: 'delete',
    path: `/auth/users/${mockId}`,
    allowedRoles: ['ADMIN'],
    successStatus: 204,
  },
];

describe('AuthController (security)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const tokenFor = (role: UserRole) => jwtService.sign({ sub: `${role}-id`, role });

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;

    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '1h' } })],
      controllers: [AuthController],
      providers: [
        {
          provide: CreateUserUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeUser()) },
        },
        {
          provide: UpdateUserUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeUser()) },
        },
        {
          provide: DeleteUserUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: LoginUseCase,
          useValue: {
            execute: jest.fn().mockResolvedValue({ access_token: 'fake-token', user: makeUser() }),
          },
        },
        {
          provide: ListUsersUseCase,
          useValue: { execute: jest.fn().mockResolvedValue([makeUser()]) },
        },
        {
          provide: GetUserByEmailUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeUser()) },
        },
        JwtStrategy,
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    jwtService = module.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
    delete process.env.JWT_SECRET;
  });

  describe.each(endpoints)(
    '$description',
    ({ method, path, body, allowedRoles, successStatus }) => {
      it('should return 401 when no Authorization header is sent', async () => {
        await request(app.getHttpServer())
          [method](path)
          .send(body ?? {})
          .expect(401);
      });

      it('should return 401 when the Authorization header is "Bearer " (empty token)', async () => {
        await request(app.getHttpServer())
          [method](path)
          .set('Authorization', 'Bearer ')
          .send(body ?? {})
          .expect(401);
      });

      describe.each(ALL_ROLES)('as role %s', (role) => {
        const isAllowed = allowedRoles.includes(role);

        it(`should return ${isAllowed ? successStatus : 403} when authenticated`, async () => {
          await request(app.getHttpServer())
            [method](path)
            .set('Authorization', `Bearer ${tokenFor(role)}`)
            .send(body ?? {})
            .expect(isAllowed ? successStatus : 403);
        });
      });
    },
  );

  describe('POST /auth/login', () => {
    it('should return 200 with no Authorization header (public endpoint)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'john@example.com', password: 'Password123' })
        .expect(200);
    });
  });
});
