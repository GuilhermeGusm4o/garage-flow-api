import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { ServiceModule } from '@service/service.module';
import { PrismaModule } from '@infra/database/prisma/prisma.module';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { JwtAuthGuard } from '@auth/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/security/roles.guard';
import { JwtStrategy } from '@auth/infrastructure/security/jwt.strategy';
import {
  startTestDatabase,
  stopTestDatabase,
  type TestDatabase,
} from '../../../support/postgres-test-container';
import { truncateAllTables } from '../../../support/truncate-database';
import { signAuthToken } from '../../../support/auth-token.helper';

jest.setTimeout(120_000);

describe('ServiceController (integration)', () => {
  let testDatabase: TestDatabase;
  let originalDatabaseUrl: string | undefined;
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const adminAuthHeader = () => signAuthToken(jwtService, 'admin-id', 'ADMIN');

  beforeAll(async () => {
    originalDatabaseUrl = process.env.DATABASE_URL;
    testDatabase = await startTestDatabase();
    process.env.DATABASE_URL = testDatabase.databaseUrl;

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        ServiceModule,
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
    if (testDatabase) await stopTestDatabase(testDatabase);
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  beforeEach(async () => {
    await truncateAllTables(prisma);
  });

  describe('POST /services', () => {
    it('creates a service and returns the price formatted with two decimals', async () => {
      const response = await request(app.getHttpServer())
        .post('/services')
        .set('Authorization', adminAuthHeader())
        .send({ name: 'Troca de óleo', price: 150 })
        .expect(201);

      expect(response.body).toMatchObject({ name: 'Troca de óleo', price: '150.00' });
      expect(response.body.id).toEqual(expect.any(String));

      const stored = await prisma.service.findUnique({ where: { id: response.body.id } });
      expect(stored).not.toBeNull();
    });

    it('returns 400 when price is zero or negative', async () => {
      await request(app.getHttpServer())
        .post('/services')
        .set('Authorization', adminAuthHeader())
        .send({ name: 'Troca de óleo', price: 0 })
        .expect(400);

      await request(app.getHttpServer())
        .post('/services')
        .set('Authorization', adminAuthHeader())
        .send({ name: 'Troca de óleo', price: -10 })
        .expect(400);
    });
  });

  describe('GET /services', () => {
    it('lists all services', async () => {
      await prisma.service.create({ data: { name: 'Troca de óleo', price: 100 } });
      await prisma.service.create({ data: { name: 'Alinhamento', price: 80 } });

      const response = await request(app.getHttpServer())
        .get('/services')
        .set('Authorization', adminAuthHeader())
        .expect(200);

      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /services/:id', () => {
    it('returns a service by id', async () => {
      const service = await prisma.service.create({ data: { name: 'Troca de óleo', price: 100 } });

      const response = await request(app.getHttpServer())
        .get(`/services/${service.id}`)
        .set('Authorization', adminAuthHeader())
        .expect(200);

      expect(response.body).toMatchObject({ id: service.id, name: 'Troca de óleo' });
    });

    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .get('/services/00000000-0000-0000-0000-000000000000')
        .set('Authorization', adminAuthHeader())
        .expect(404);
    });
  });

  describe('PATCH /services/:id', () => {
    it('updates only the name when only name is sent', async () => {
      const service = await prisma.service.create({ data: { name: 'Troca de óleo', price: 100 } });

      const response = await request(app.getHttpServer())
        .patch(`/services/${service.id}`)
        .set('Authorization', adminAuthHeader())
        .send({ name: 'Alinhamento' })
        .expect(200);

      expect(response.body).toMatchObject({ name: 'Alinhamento', price: '100.00' });
    });

    it('updates only the price when only price is sent', async () => {
      const service = await prisma.service.create({ data: { name: 'Troca de óleo', price: 100 } });

      const response = await request(app.getHttpServer())
        .patch(`/services/${service.id}`)
        .set('Authorization', adminAuthHeader())
        .send({ price: 200 })
        .expect(200);

      expect(response.body).toMatchObject({ name: 'Troca de óleo', price: '200.00' });
    });

    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .patch('/services/00000000-0000-0000-0000-000000000000')
        .set('Authorization', adminAuthHeader())
        .send({ name: 'Alinhamento' })
        .expect(404);
    });
  });

  describe('DELETE /services/:id', () => {
    it('soft-deletes a service and hides it from further lookups', async () => {
      const service = await prisma.service.create({ data: { name: 'Troca de óleo', price: 100 } });

      await request(app.getHttpServer())
        .delete(`/services/${service.id}`)
        .set('Authorization', adminAuthHeader())
        .expect(204);

      await request(app.getHttpServer())
        .get(`/services/${service.id}`)
        .set('Authorization', adminAuthHeader())
        .expect(404);

      const stored = await prisma.service.findUnique({ where: { id: service.id } });
      expect(stored?.deleted_at).not.toBeNull();
    });

    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .delete('/services/00000000-0000-0000-0000-000000000000')
        .set('Authorization', adminAuthHeader())
        .expect(404);
    });
  });
});
