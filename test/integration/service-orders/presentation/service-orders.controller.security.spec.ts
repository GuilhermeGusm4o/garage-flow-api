import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { type UUID } from 'crypto';

import { ServiceOrdersController } from '@service-orders/presentation/service-orders.controller';
import { CreateServiceOrderUseCase } from '@service-orders/application/use-cases/create-service-order.use-case';
import { FindServiceOrderByIdUseCase } from '@service-orders/application/use-cases/find-service-order-by-id.use-case';
import { FindAllServiceOrdersUseCase } from '@service-orders/application/use-cases/find-all-service-orders.use-case';
import { UpdateServiceOrderUseCase } from '@service-orders/application/use-cases/update-service-order.use-case';
import { UpdateServiceOrderStatusUseCase } from '@service-orders/application/use-cases/update-service-order-status.use-case';
import { SoftDeleteServiceOrderUseCase } from '@service-orders/application/use-cases/soft-delete-service-order.use-case';
import { AddServicesAndPartsUseCase } from '@service-orders/application/use-cases/add-services-and-parts.use-case';
import { StartDiagnosisUseCase } from '@service-orders/application/use-cases/start-diagnosis.use-case';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type UserRole } from '@auth/domain/entities/user.entity';
import { JwtAuthGuard } from '@auth/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/security/roles.guard';
import { JwtStrategy } from '@auth/infrastructure/security/jwt.strategy';

const JWT_SECRET = 'test-secret';
const mockId = '123e4567-e89b-12d3-a456-426614174000' as UUID;

const ALL_ROLES: UserRole[] = ['ADMIN', 'MECHANIC', 'SERVICE_ADVISOR', 'STOCK_CLERK'];

const makeServiceOrder = (): ServiceOrder =>
  ServiceOrder.create(
    'vehicle-id',
    'Ruído no motor',
    [new ServiceItem(null, 'service-id', 100)],
    [],
    100,
  );

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
    description: 'POST /service-orders',
    method: 'post',
    path: '/service-orders',
    body: {
      clientCpfCnpj: '123.456.789-00',
      licensePlate: 'ABC1D23',
      description: 'Ruído no motor',
    },
    allowedRoles: ['ADMIN', 'SERVICE_ADVISOR'],
    successStatus: 201,
  },
  {
    description: 'GET /service-orders',
    method: 'get',
    path: '/service-orders',
    allowedRoles: ALL_ROLES,
    successStatus: 200,
  },
  {
    description: 'GET /service-orders/:id',
    method: 'get',
    path: `/service-orders/${mockId}`,
    allowedRoles: ALL_ROLES,
    successStatus: 200,
  },
  {
    description: 'PATCH /service-orders/:id',
    method: 'patch',
    path: `/service-orders/${mockId}`,
    body: { status: ServiceOrderStatus.IN_DIAGNOSIS },
    allowedRoles: ['ADMIN'],
    successStatus: 200,
  },
  {
    description: 'DELETE /service-orders/:id',
    method: 'delete',
    path: `/service-orders/${mockId}`,
    allowedRoles: ['ADMIN', 'SERVICE_ADVISOR'],
    successStatus: 204,
  },
  {
    description: 'PATCH /service-orders/:id/services-and-parts',
    method: 'patch',
    path: `/service-orders/${mockId}/services-and-parts`,
    body: { services: [], parts: [] },
    allowedRoles: ['ADMIN', 'MECHANIC'],
    successStatus: 200,
  },
  {
    description: 'PATCH /service-orders/:id/status',
    method: 'patch',
    path: `/service-orders/${mockId}/status`,
    body: { status: ServiceOrderStatus.IN_DIAGNOSIS },
    allowedRoles: ['ADMIN', 'MECHANIC', 'SERVICE_ADVISOR'],
    successStatus: 200,
  },
  {
    description: 'PATCH /service-orders/:id/start-diagnosis',
    method: 'patch',
    path: `/service-orders/${mockId}/start-diagnosis`,
    allowedRoles: ['MECHANIC'],
    successStatus: 200,
  },
];

describe('ServiceOrdersController (security)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const tokenFor = (role: UserRole) => jwtService.sign({ sub: `${role}-id`, role });

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;

    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '1h' } })],
      controllers: [ServiceOrdersController],
      providers: [
        {
          provide: CreateServiceOrderUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeServiceOrder()) },
        },
        {
          provide: FindServiceOrderByIdUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeServiceOrder()) },
        },
        {
          provide: FindAllServiceOrdersUseCase,
          useValue: { execute: jest.fn().mockResolvedValue([makeServiceOrder()]) },
        },
        {
          provide: UpdateServiceOrderUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeServiceOrder()) },
        },
        {
          provide: UpdateServiceOrderStatusUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeServiceOrder()) },
        },
        {
          provide: SoftDeleteServiceOrderUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: AddServicesAndPartsUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeServiceOrder()) },
        },
        {
          provide: StartDiagnosisUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeServiceOrder()) },
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
