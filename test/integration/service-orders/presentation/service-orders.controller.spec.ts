import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { ServiceOrdersModule } from '@service-orders/service-orders.module';
import { PrismaModule } from '@infra/database/prisma/prisma.module';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { DomainExceptionFilter } from '@common/filters/domain-exception.filter';
import { JwtAuthGuard } from '@auth/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/security/roles.guard';
import { JwtStrategy } from '@auth/infrastructure/security/jwt.strategy';
import {
  startTestDatabase,
  stopTestDatabase,
  type TestDatabase,
} from '../../../support/postgres-test-container';
import { truncateAllTables } from '../../../support/truncate-database';

jest.setTimeout(120_000);

describe('ServiceOrdersController (integration)', () => {
  let testDatabase: TestDatabase;
  let originalDatabaseUrl: string | undefined;
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let clientCpfCnpj: string;
  let licensePlate: string;
  let serviceId: string;
  let partId: string;

  const adminAuthHeader = () => `Bearer ${jwtService.sign({ sub: 'admin-id', role: 'ADMIN' })}`;

  beforeAll(async () => {
    originalDatabaseUrl = process.env.DATABASE_URL;
    testDatabase = await startTestDatabase();
    process.env.DATABASE_URL = testDatabase.databaseUrl;

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        ServiceOrdersModule,
        JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '1h' } }),
      ],
      providers: [JwtStrategy, JwtAuthGuard, RolesGuard],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new DomainExceptionFilter());
    prisma = moduleRef.get(PrismaService);
    jwtService = moduleRef.get(JwtService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await stopTestDatabase(testDatabase);
    process.env.DATABASE_URL = originalDatabaseUrl;
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
    clientCpfCnpj = client.cpfCnpj;

    const vehicle = await prisma.vehicle.create({
      data: {
        brand: 'Fiat',
        model: 'Uno',
        licensePlate: 'TST1234',
        year: 2020,
        clientId: client.id,
      },
    });
    licensePlate = vehicle.licensePlate;

    const service = await prisma.service.create({ data: { name: 'Troca de óleo', price: 100 } });
    serviceId = service.id;

    const part = await prisma.inventory.create({
      data: { name: 'Óleo', unitOfMeasure: 'ML', unitPrice: 30, quantity: 10 },
    });
    partId = part.id;
  });

  it('POST /service-orders deve criar uma OS sem itens e com valor total zerado', async () => {
    const response = await request(app.getHttpServer())
      .post('/service-orders')
      .set('Authorization', adminAuthHeader())
      .send({ clientCpfCnpj, licensePlate });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('RECEIVED');
    expect(response.body.serviceItems).toEqual([]);
    expect(response.body.partItems).toEqual([]);
    expect(response.body.totalAmount).toBe(0);
  });

  it('POST /service-orders deve rejeitar cliente inexistente', async () => {
    const response = await request(app.getHttpServer())
      .post('/service-orders')
      .set('Authorization', adminAuthHeader())
      .send({ clientCpfCnpj: '00000000000', licensePlate });

    expect(response.status).toBe(404);
  });

  it('GET /service-orders deve listar apenas as OS criadas neste teste', async () => {
    const created = await request(app.getHttpServer())
      .post('/service-orders')
      .set('Authorization', adminAuthHeader())
      .send({ clientCpfCnpj, licensePlate });

    const response = await request(app.getHttpServer())
      .get('/service-orders')
      .set('Authorization', adminAuthHeader());

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(created.body.id);
  });

  it('PATCH /service-orders/:id deve atualizar o status', async () => {
    const created = await request(app.getHttpServer())
      .post('/service-orders')
      .set('Authorization', adminAuthHeader())
      .send({ clientCpfCnpj, licensePlate });

    const response = await request(app.getHttpServer())
      .patch(`/service-orders/${created.body.id}`)
      .set('Authorization', adminAuthHeader())
      .send({ status: 'IN_DIAGNOSIS' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('IN_DIAGNOSIS');
  });

  it('DELETE /service-orders/:id deve fazer soft delete', async () => {
    const created = await request(app.getHttpServer())
      .post('/service-orders')
      .set('Authorization', adminAuthHeader())
      .send({ clientCpfCnpj, licensePlate });

    const response = await request(app.getHttpServer())
      .delete(`/service-orders/${created.body.id}`)
      .set('Authorization', adminAuthHeader());

    expect(response.status).toBe(204);
  });

  it('PATCH /service-orders/:id/services-and-parts deve adicionar serviços e peças e recalcular o total', async () => {
    const created = await request(app.getHttpServer())
      .post('/service-orders')
      .set('Authorization', adminAuthHeader())
      .send({ clientCpfCnpj, licensePlate });

    const response = await request(app.getHttpServer())
      .patch(`/service-orders/${created.body.id}/services-and-parts`)
      .set('Authorization', adminAuthHeader())
      .send({
        services: [{ serviceId }],
        parts: [{ inventoryId: partId, quantity: 2 }],
      });

    expect(response.status).toBe(200);
    expect(response.body.serviceItems).toHaveLength(1);
    expect(response.body.partItems).toHaveLength(1);
    expect(response.body.totalAmount).toBe(260); // 100 (item) + 100 (serviço atual) + 2*30 (peça)
  });

  it('PATCH /service-orders/:id/services-and-parts deve acumular itens em chamadas sucessivas', async () => {
    const created = await request(app.getHttpServer())
      .post('/service-orders')
      .set('Authorization', adminAuthHeader())
      .send({ clientCpfCnpj, licensePlate });

    await request(app.getHttpServer())
      .patch(`/service-orders/${created.body.id}/services-and-parts`)
      .set('Authorization', adminAuthHeader())
      .send({ services: [{ serviceId }], parts: [] });

    const response = await request(app.getHttpServer())
      .patch(`/service-orders/${created.body.id}/services-and-parts`)
      .set('Authorization', adminAuthHeader())
      .send({ services: [], parts: [{ inventoryId: partId, quantity: 1 }] });

    expect(response.status).toBe(200);
    expect(response.body.serviceItems).toHaveLength(1);
    expect(response.body.partItems).toHaveLength(1);
  });

  it('PATCH /service-orders/:id/services-and-parts deve retornar 404 se a OS não existir', async () => {
    const response = await request(app.getHttpServer())
      .patch('/service-orders/00000000-0000-0000-0000-000000000000/services-and-parts')
      .set('Authorization', adminAuthHeader())
      .send({ services: [{ serviceId }], parts: [] });

    expect(response.status).toBe(404);
  });

  it('PATCH /service-orders/:id/services-and-parts deve retornar 400 se a quantidade solicitada exceder a disponível', async () => {
    const created = await request(app.getHttpServer())
      .post('/service-orders')
      .set('Authorization', adminAuthHeader())
      .send({ clientCpfCnpj, licensePlate });

    const response = await request(app.getHttpServer())
      .patch(`/service-orders/${created.body.id}/services-and-parts`)
      .set('Authorization', adminAuthHeader())
      .send({ services: [], parts: [{ inventoryId: partId, quantity: 999 }] });

    expect(response.status).toBe(400);
  });
});
