import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { type UUID } from 'crypto';

import { VehicleController } from '@vehicle/presentation/vehicle.controller';
import { CreateVehicleUseCase } from '@vehicle/application/use-cases/create-vehicle.use-case';
import { FindAllVehiclesUseCase } from '@vehicle/application/use-cases/find-all-vehicles.use-case';
import { FindVehicleByIdUseCase } from '@vehicle/application/use-cases/find-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from '@vehicle/application/use-cases/update-vehicle.use-case';
import { DeleteVehicleUseCase } from '@vehicle/application/use-cases/delete-vehicle.use-case';
import { VehicleEntity } from '@vehicle/domain/entities/vehicle.entity';
import { LicensePlate } from '@vehicle/domain/value-objects/license-plate.vo';
import { type UserRole } from '@auth/domain/entities/user.entity';
import { JwtAuthGuard } from '@auth/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/security/roles.guard';
import { JwtStrategy } from '@auth/infrastructure/security/jwt.strategy';

const JWT_SECRET = 'test-secret';
const mockId = '123e4567-e89b-12d3-a456-426614174000' as UUID;

const ALL_ROLES: UserRole[] = ['ADMIN', 'MECHANIC', 'SERVICE_ADVISOR', 'STOCK_CLERK'];

const makeVehicle = (): VehicleEntity =>
  VehicleEntity.create({
    id: mockId,
    brand: 'Volkswagen',
    model: 'Gol',
    licensePlate: LicensePlate.create('ABC1D23'),
    year: 2020,
    clientId: mockId,
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
    description: 'POST /vehicles',
    method: 'post',
    path: '/vehicles',
    body: {
      brand: 'Volkswagen',
      model: 'Gol',
      licensePlate: 'ABC1D23',
      year: 2020,
      clientId: mockId,
    },
    allowedRoles: ['ADMIN', 'SERVICE_ADVISOR'],
    successStatus: 201,
  },
  {
    description: 'GET /vehicles',
    method: 'get',
    path: '/vehicles',
    allowedRoles: ALL_ROLES,
    successStatus: 200,
  },
  {
    description: 'GET /vehicles/:id',
    method: 'get',
    path: `/vehicles/${mockId}`,
    allowedRoles: ALL_ROLES,
    successStatus: 200,
  },
  {
    description: 'PATCH /vehicles/:id',
    method: 'patch',
    path: `/vehicles/${mockId}`,
    body: { brand: 'Fiat' },
    allowedRoles: ['ADMIN', 'SERVICE_ADVISOR'],
    successStatus: 200,
  },
  {
    description: 'DELETE /vehicles/:id',
    method: 'delete',
    path: `/vehicles/${mockId}`,
    allowedRoles: ['ADMIN'],
    successStatus: 204,
  },
];

describe('VehicleController (security)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const tokenFor = (role: UserRole) => jwtService.sign({ sub: `${role}-id`, role });

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;

    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '1h' } })],
      controllers: [VehicleController],
      providers: [
        {
          provide: CreateVehicleUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeVehicle()) },
        },
        {
          provide: FindAllVehiclesUseCase,
          useValue: { execute: jest.fn().mockResolvedValue([makeVehicle()]) },
        },
        {
          provide: FindVehicleByIdUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeVehicle()) },
        },
        {
          provide: UpdateVehicleUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(makeVehicle()) },
        },
        {
          provide: DeleteVehicleUseCase,
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
