import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { VehicleModule } from '@vehicle/vehicle.module';
import { PrismaModule } from '@infra/database/prisma/prisma.module';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { JwtAuthGuard } from '@auth/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/security/roles.guard';
import { JwtStrategy } from '@auth/infrastructure/security/jwt.strategy';
import { truncateAllTables } from '../../../support/truncate-database';
import { signAuthToken } from '../../../support/auth-token.helper';

describe('VehicleController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let clientId: string;

  const adminAuthHeader = () => signAuthToken(jwtService, 'admin-id', 'ADMIN');

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        VehicleModule,
        JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '1h' } }),
      ],
      providers: [JwtStrategy, JwtAuthGuard, RolesGuard],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    prisma = moduleRef.get(PrismaService);
    jwtService = moduleRef.get(JwtService);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(async () => {
    await truncateAllTables(prisma);

    const client = await prisma.client.create({
      data: {
        cpfCnpj: '52998224725',
        name: 'Cliente Teste',
        address: 'Rua X',
        phone: '11999990000',
      },
    });
    clientId = client.id;
  });

  describe('POST /vehicles', () => {
    it('creates a vehicle with an old-format plate', async () => {
      const response = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', adminAuthHeader())
        .send({ brand: 'Fiat', model: 'Uno', licensePlate: 'ABC1234', year: 2015, clientId })
        .expect(201);

      expect(response.body).toMatchObject({ plateFormat: 'OLD', licensePlate: 'ABC-1234' });
    });

    it('creates a vehicle with a Mercosul-format plate', async () => {
      const response = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', adminAuthHeader())
        .send({ brand: 'Volkswagen', model: 'Gol', licensePlate: 'ABC1D23', year: 2020, clientId })
        .expect(201);

      expect(response.body).toMatchObject({ plateFormat: 'MERCOSUL', licensePlate: 'ABC1D23' });
    });

    it('returns 400 for an invalid license plate', async () => {
      await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', adminAuthHeader())
        .send({ brand: 'Fiat', model: 'Uno', licensePlate: 'AB1234', year: 2015, clientId })
        .expect(400);
    });

    it('returns 404 when the client does not exist', async () => {
      await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', adminAuthHeader())
        .send({
          brand: 'Fiat',
          model: 'Uno',
          licensePlate: 'ABC1234',
          year: 2015,
          clientId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(404);
    });

    it('returns 409 when the license plate is already registered', async () => {
      const payload = { brand: 'Fiat', model: 'Uno', licensePlate: 'ABC1234', year: 2015, clientId };

      await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', adminAuthHeader())
        .send(payload)
        .expect(201);

      await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', adminAuthHeader())
        .send(payload)
        .expect(409);
    });
  });

  describe('GET /vehicles', () => {
    it('lists all vehicles', async () => {
      await prisma.vehicle.create({
        data: { brand: 'Fiat', model: 'Uno', licensePlate: 'ABC1234', year: 2015, clientId },
      });

      const response = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', adminAuthHeader())
        .expect(200);

      expect(response.body).toHaveLength(1);
    });
  });

  describe('GET /vehicles/:id', () => {
    it('returns a vehicle by id', async () => {
      const vehicle = await prisma.vehicle.create({
        data: { brand: 'Fiat', model: 'Uno', licensePlate: 'ABC1234', year: 2015, clientId },
      });

      const response = await request(app.getHttpServer())
        .get(`/vehicles/${vehicle.id}`)
        .set('Authorization', adminAuthHeader())
        .expect(200);

      expect(response.body).toMatchObject({ id: vehicle.id, brand: 'Fiat' });
    });

    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .get('/vehicles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', adminAuthHeader())
        .expect(404);
    });
  });

  describe('PATCH /vehicles/:id', () => {
    it('updates brand, model and year', async () => {
      const vehicle = await prisma.vehicle.create({
        data: { brand: 'Fiat', model: 'Uno', licensePlate: 'ABC1234', year: 2015, clientId },
      });

      const response = await request(app.getHttpServer())
        .patch(`/vehicles/${vehicle.id}`)
        .set('Authorization', adminAuthHeader())
        .send({ brand: 'Fiat', model: 'Mobi', year: 2021 })
        .expect(200);

      expect(response.body).toMatchObject({ model: 'Mobi', year: 2021 });
    });

    it('returns 400 when the body includes licensePlate (not part of the update DTO)', async () => {
      const vehicle = await prisma.vehicle.create({
        data: { brand: 'Fiat', model: 'Uno', licensePlate: 'ABC1234', year: 2015, clientId },
      });

      await request(app.getHttpServer())
        .patch(`/vehicles/${vehicle.id}`)
        .set('Authorization', adminAuthHeader())
        .send({ licensePlate: 'XYZ9999' })
        .expect(400);
    });

    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .patch('/vehicles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', adminAuthHeader())
        .send({ brand: 'Fiat' })
        .expect(404);
    });
  });

  describe('DELETE /vehicles/:id', () => {
    it('soft-deletes a vehicle', async () => {
      const vehicle = await prisma.vehicle.create({
        data: { brand: 'Fiat', model: 'Uno', licensePlate: 'ABC1234', year: 2015, clientId },
      });

      await request(app.getHttpServer())
        .delete(`/vehicles/${vehicle.id}`)
        .set('Authorization', adminAuthHeader())
        .expect(204);

      const stored = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
      expect(stored?.deleted_at).not.toBeNull();
    });

    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .delete('/vehicles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', adminAuthHeader())
        .expect(404);
    });
  });
});
