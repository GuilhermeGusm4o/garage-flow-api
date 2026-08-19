import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { type UUID } from 'crypto';

import { ServiceController } from '@service/presentation/service.controller';
import { CreateServiceUseCase } from '@service/application/use-cases/create-service.use-case';
import { FindAllServicesUseCase } from '@service/application/use-cases/find-all-services.use-case';
import { FindServiceByIdUseCase } from '@service/application/use-cases/find-service-by-id.use-case';
import { UpdateServiceUseCase } from '@service/application/use-cases/update-service.use-case';
import { DeleteServiceUseCase } from '@service/application/use-cases/delete-service.use-case';
import { ServiceEntity } from '@service/domain/entities/service.entity';
import { ServicePrice } from '@service/domain/value-objects/service-price.value-object';
import { JwtAuthGuard } from '@auth/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/security/roles.guard';
import { JwtStrategy } from '@auth/infrastructure/security/jwt.strategy';

const JWT_SECRET = 'test-secret';
const mockId = '123e4567-e89b-12d3-a456-426614174000' as UUID;

const makeService = (): ServiceEntity =>
  ServiceEntity.create({
    id: mockId,
    name: 'Troca de óleo',
    price: ServicePrice.create(150),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  });

type Endpoint = {
  description: string;
  method: 'get' | 'post' | 'patch' | 'delete';
  path: string;
  body?: Record<string, unknown>;
  adminOnly: boolean;
  successStatus: number;
};

const endpoints: Endpoint[] = [
  {
    description: 'POST /services',
    method: 'post',
    path: '/services',
    body: { name: 'Troca de óleo', price: 150 },
    adminOnly: true,
    successStatus: 201,
  },
  {
    description: 'GET /services',
    method: 'get',
    path: '/services',
    adminOnly: false,
    successStatus: 200,
  },
  {
    description: 'GET /services/:id',
    method: 'get',
    path: `/services/${mockId}`,
    adminOnly: false,
    successStatus: 200,
  },
  {
    description: 'PATCH /services/:id',
    method: 'patch',
    path: `/services/${mockId}`,
    body: { name: 'Alinhamento' },
    adminOnly: true,
    successStatus: 200,
  },
  {
    description: 'DELETE /services/:id',
    method: 'delete',
    path: `/services/${mockId}`,
    adminOnly: true,
    successStatus: 204,
  },
];

describe('ServiceController (security)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const adminToken = () => jwtService.sign({ sub: 'admin-id', role: 'ADMIN' });
  const nonAdminToken = () => jwtService.sign({ sub: 'mechanic-id', role: 'MECHANIC' });

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;

    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '1h' } })],
      controllers: [ServiceController],
      providers: [
        {
          provide: CreateServiceUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeService()) },
        },
        {
          provide: FindAllServicesUseCase,
          useValue: { execute: jest.fn().mockResolvedValue([makeService()]) },
        },
        {
          provide: FindServiceByIdUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeService()) },
        },
        {
          provide: UpdateServiceUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeService()) },
        },
        {
          provide: DeleteServiceUseCase,
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
    ({ method, path, body, adminOnly, successStatus }) => {
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

      if (adminOnly) {
        it('should return 403 when authenticated as a non-ADMIN role', async () => {
          await request(app.getHttpServer())
            [method](path)
            .set('Authorization', `Bearer ${nonAdminToken()}`)
            .send(body ?? {})
            .expect(403);
        });

        it('should allow access when authenticated as ADMIN', async () => {
          await request(app.getHttpServer())
            [method](path)
            .set('Authorization', `Bearer ${adminToken()}`)
            .send(body ?? {})
            .expect(successStatus);
        });
      } else {
        it('should allow access when authenticated as ADMIN', async () => {
          await request(app.getHttpServer())
            [method](path)
            .set('Authorization', `Bearer ${adminToken()}`)
            .send(body ?? {})
            .expect(successStatus);
        });

        it('should allow access when authenticated as a non-ADMIN role', async () => {
          await request(app.getHttpServer())
            [method](path)
            .set('Authorization', `Bearer ${nonAdminToken()}`)
            .send(body ?? {})
            .expect(successStatus);
        });
      }
    },
  );
});
