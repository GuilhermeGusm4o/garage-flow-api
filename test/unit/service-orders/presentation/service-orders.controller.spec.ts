import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ServiceOrdersModule } from '@service-orders/service-orders.module';
import { PrismaModule } from '@infra/database/prisma/prisma.module';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { DomainExceptionFilter } from '@common/filters/domain-exception.filter';

describe('ServiceOrdersController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clientCpfCnpj: string;
  let licensePlate: string;
  let serviceId: string;
  let partId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, ServiceOrdersModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new DomainExceptionFilter());
    prisma = moduleRef.get(PrismaService);
    await app.init();

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

  afterAll(async () => {
    await prisma.serviceOrderInventory.deleteMany();
    await prisma.serviceOrderService.deleteMany();
    await prisma.serviceOrder.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.service.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.client.deleteMany();
    await app.close();
  });

  it('POST /service-orders deve criar uma OS', async () => {
    const response = await request(app.getHttpServer())
      .post('/service-orders')
      .send({
        clientCpfCnpj,
        licensePlate,
        services: [{ serviceId }],
        parts: [{ inventoryId: partId, quantity: 2 }],
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('RECEIVED');
    expect(response.body.totalAmount).toBe(160);
  });

  it('POST /service-orders deve rejeitar cliente inexistente', async () => {
    const response = await request(app.getHttpServer())
      .post('/service-orders')
      .send({ clientCpfCnpj: '00000000000', licensePlate, services: [], parts: [] });

    expect(response.status).toBe(404);
  });

  it('GET /service-orders deve listar OS', async () => {
    const response = await request(app.getHttpServer()).get('/service-orders');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('PATCH /service-orders/:id deve atualizar o status', async () => {
    const created = await request(app.getHttpServer())
      .post('/service-orders')
      .send({ clientCpfCnpj, licensePlate, services: [{ serviceId }], parts: [] });

    const response = await request(app.getHttpServer())
      .patch(`/service-orders/${created.body.id}`)
      .send({ status: 'IN_DIAGNOSIS' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('IN_DIAGNOSIS');
  });

  it('DELETE /service-orders/:id deve fazer soft delete', async () => {
    const created = await request(app.getHttpServer())
      .post('/service-orders')
      .send({ clientCpfCnpj, licensePlate, services: [], parts: [] });

    const response = await request(app.getHttpServer()).delete(
      `/service-orders/${created.body.id}`,
    );
    expect(response.status).toBe(204);
  });
});
