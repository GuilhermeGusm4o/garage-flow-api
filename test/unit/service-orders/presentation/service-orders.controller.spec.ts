import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ServiceOrdersModule } from '@service-orders/service-orders.module';
import { PrismaModule } from '@infra/database/prisma/prisma.module';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { DomainExceptionFilter } from '@common/filters/domain-exception.filter';

describe('ServiceOrdersController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clientId: string;
  let clientCpfCnpj: string;
  let vehicleId: string;
  let licensePlate: string;
  let serviceId: string;
  let partId: string;
  const createdServiceOrderIds: string[] = [];

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
    clientId = client.id;
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
    vehicleId = vehicle.id;
    licensePlate = vehicle.licensePlate;

    const service = await prisma.service.create({ data: { name: 'Troca de óleo', price: 100 } });
    serviceId = service.id;

    const part = await prisma.inventory.create({
      data: { name: 'Óleo', unitOfMeasure: 'ML', unitPrice: 30, quantity: 10 },
    });
    partId = part.id;
  });

  afterAll(async () => {
    await prisma.serviceOrderInventory.deleteMany({
      where: { serviceOrderId: { in: createdServiceOrderIds } },
    });
    await prisma.serviceOrderService.deleteMany({
      where: { serviceOrderId: { in: createdServiceOrderIds } },
    });
    await prisma.serviceOrder.deleteMany({ where: { id: { in: createdServiceOrderIds } } });
    await prisma.inventory.deleteMany({ where: { id: partId } });
    await prisma.service.deleteMany({ where: { id: serviceId } });
    await prisma.vehicle.deleteMany({ where: { id: vehicleId } });
    await prisma.client.deleteMany({ where: { id: clientId } });
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
    createdServiceOrderIds.push(response.body.id);
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
    createdServiceOrderIds.push(created.body.id);

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
    createdServiceOrderIds.push(created.body.id);

    const response = await request(app.getHttpServer()).delete(
      `/service-orders/${created.body.id}`,
    );
    expect(response.status).toBe(204);
  });
});
