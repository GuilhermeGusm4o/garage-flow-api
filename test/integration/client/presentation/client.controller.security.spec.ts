import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { type UUID } from 'crypto';

import { ClientController } from '@client/presentation/client.controller';
import { CreateClientUseCase } from '@client/application/use-cases/create-client.use-case';
import { FindAllClientsUseCase } from '@client/application/use-cases/find-all-clients.use-case';
import { FindClientByIdUseCase } from '@client/application/use-cases/find-client-by-id.use-case';
import { UpdateClientUseCase } from '@client/application/use-cases/update-client.use-case';
import { DeleteClientUseCase } from '@client/application/use-cases/delete-client.use-case';
import { ClientEntity } from '@client/domain/entities/client.entity';
import { CpfCnpj } from '@client/domain/value-objects/cpf-cnpj-validator.vo';
import { type UserRole } from '@auth/domain/entities/user.entity';
import { JwtAuthGuard } from '@auth/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/security/roles.guard';
import { JwtStrategy } from '@auth/infrastructure/security/jwt.strategy';

const JWT_SECRET = 'test-secret';
const mockId = '123e4567-e89b-12d3-a456-426614174000' as UUID;

const ALL_ROLES: UserRole[] = ['ADMIN', 'MECHANIC', 'SERVICE_ADVISOR', 'STOCK_CLERK'];

const makeClient = (): ClientEntity =>
  ClientEntity.create({
    id: mockId,
    cpfCnpj: CpfCnpj.create('52998224725'),
    name: 'João da Silva',
    phone: '11999998888',
    address: 'Rua das Flores, 123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  });

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
    description: 'POST /clients',
    method: 'post',
    path: '/clients',
    body: {
      cpfCnpj: '52998224725',
      name: 'João da Silva',
      phone: '11999998888',
      address: 'Rua das Flores, 123',
    },
    allowedRoles: ['ADMIN', 'SERVICE_ADVISOR'],
    successStatus: 201,
  },
  {
    description: 'GET /clients',
    method: 'get',
    path: '/clients',
    allowedRoles: ALL_ROLES,
    successStatus: 200,
  },
  {
    description: 'GET /clients/:id',
    method: 'get',
    path: `/clients/${mockId}`,
    allowedRoles: ALL_ROLES,
    successStatus: 200,
  },
  {
    description: 'PATCH /clients/:id',
    method: 'patch',
    path: `/clients/${mockId}`,
    body: { name: 'Novo Nome' },
    allowedRoles: ['ADMIN', 'SERVICE_ADVISOR'],
    successStatus: 200,
  },
  {
    description: 'DELETE /clients/:id',
    method: 'delete',
    path: `/clients/${mockId}`,
    allowedRoles: ['ADMIN'],
    successStatus: 204,
  },
];

describe('ClientController (security)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const tokenFor = (role: UserRole) => jwtService.sign({ sub: `${role}-id`, role });

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;

    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '1h' } })],
      controllers: [ClientController],
      providers: [
        {
          provide: CreateClientUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeClient()) },
        },
        {
          provide: FindAllClientsUseCase,
          useValue: { execute: jest.fn().mockResolvedValue([makeClient()]) },
        },
        {
          provide: FindClientByIdUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeClient()) },
        },
        {
          provide: UpdateClientUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeClient()) },
        },
        {
          provide: DeleteClientUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(undefined) },
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
});
