import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { type UUID } from 'crypto';

import { InventoryController } from '@inventory/presentation/inventory.controller';
import { CreatePartUseCase } from '@inventory/application/use-cases/create-part.use-case';
import { RestockPartUseCase } from '@inventory/application/use-cases/restock-part.use-case';
import { ConsumePartUseCase } from '@inventory/application/use-cases/consume-part.use-case';
import { ListPartsUseCase } from '@inventory/application/use-cases/list-parts.use-case';
import { ListLowStockPartsUseCase } from '@inventory/application/use-cases/list-low-stock-parts.use-case';
import { UpdatePartUseCase } from '@inventory/application/use-cases/update-part.use-case';
import { SoftDeletePartUseCase } from '@inventory/application/use-cases/soft-delete-part.use-case';
import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';
import { StockLevel } from '@inventory/domain/value-objects/stock-level.vo';
import { type UserRole } from '@auth/domain/entities/user.entity';
import { JwtAuthGuard } from '@auth/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/security/roles.guard';
import { JwtStrategy } from '@auth/infrastructure/security/jwt.strategy';

const JWT_SECRET = 'test-secret';
const mockId = '123e4567-e89b-12d3-a456-426614174000' as UUID;

const ALL_ROLES: UserRole[] = ['ADMIN', 'MECHANIC', 'SERVICE_ADVISOR', 'STOCK_CLERK'];

const makePart = () => ({
  id: mockId,
  name: 'Óleo',
  unitOfMeasure: 'ML',
  unitPrice: 30,
  quantity: 10,
});

const makeStockLevel = (): StockLevel =>
  new StockLevel(
    new Part(mockId, 'Óleo', new UnitOfMeasure('ML'), 30, new Quantity(2), new Quantity(5)),
    0,
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
    description: 'POST /inventory',
    method: 'post',
    path: '/inventory',
    body: { name: 'Óleo', unitOfMeasure: 'ML', unitPrice: 30, quantity: 10 },
    allowedRoles: ['ADMIN', 'STOCK_CLERK'],
    successStatus: 201,
  },
  {
    description: 'GET /inventory',
    method: 'get',
    path: '/inventory',
    allowedRoles: ALL_ROLES,
    successStatus: 200,
  },
  {
    description: 'GET /inventory/low-stock',
    method: 'get',
    path: '/inventory/low-stock',
    allowedRoles: ['ADMIN', 'STOCK_CLERK'],
    successStatus: 200,
  },
  {
    description: 'PATCH /inventory/:id',
    method: 'patch',
    path: `/inventory/${mockId}`,
    body: { name: 'Óleo sintético', unitPrice: 40 },
    allowedRoles: ['ADMIN', 'STOCK_CLERK'],
    successStatus: 200,
  },
  {
    description: 'PATCH /inventory/:id/restock',
    method: 'patch',
    path: `/inventory/${mockId}/restock`,
    body: { quantity: 5 },
    allowedRoles: ['ADMIN', 'STOCK_CLERK'],
    successStatus: 200,
  },
  {
    description: 'PATCH /inventory/:id/consume',
    method: 'patch',
    path: `/inventory/${mockId}/consume`,
    body: { quantity: 5 },
    allowedRoles: ['ADMIN', 'STOCK_CLERK'],
    successStatus: 200,
  },
  {
    description: 'DELETE /inventory/:id',
    method: 'delete',
    path: `/inventory/${mockId}`,
    allowedRoles: ['ADMIN'],
    successStatus: 204,
  },
];

describe('InventoryController (security)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const tokenFor = (role: UserRole) => jwtService.sign({ sub: `${role}-id`, role });

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;

    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '1h' } })],
      controllers: [InventoryController],
      providers: [
        {
          provide: CreatePartUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makePart()) },
        },
        {
          provide: RestockPartUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makePart()) },
        },
        {
          provide: ConsumePartUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makePart()) },
        },
        {
          provide: ListPartsUseCase,
          useValue: { execute: jest.fn().mockResolvedValue([makePart()]) },
        },
        {
          provide: ListLowStockPartsUseCase,
          useValue: { execute: jest.fn().mockResolvedValue([makeStockLevel()]) },
        },
        {
          provide: UpdatePartUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makePart()) },
        },
        {
          provide: SoftDeletePartUseCase,
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
