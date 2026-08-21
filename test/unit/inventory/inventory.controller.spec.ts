import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { InventoryModule } from '@inventory/inventory.module';
import { PrismaModule } from '@infra/database/prisma/prisma.module';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { DomainExceptionFilter } from '@common/filters/domain-exception.filter';
import { type Part } from '@inventory/domain/entities/part.entity';

describe('InventoryController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, InventoryModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new DomainExceptionFilter());
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.inventory.deleteMany();
    await app.close();
  });

  it('POST /inventory deve criar uma peça', async () => {
    const response = await request(app.getHttpServer())
      .post('/inventory')
      .send({ name: 'Óleo de motor 5W30', unitOfMeasure: 'ML', unitPrice: 45.9, quantity: 20 });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Óleo de motor 5W30');
  });

  it('POST /inventory deve rejeitar uma unidade de medida inválida', async () => {
    const response = await request(app.getHttpServer())
      .post('/inventory')
      .send({ name: 'Peça inválida', unitOfMeasure: 'LITROS', unitPrice: 10 });

    expect(response.status).toBe(400);
  });

  it('GET /inventory deve listar as peças', async () => {
    const response = await request(app.getHttpServer()).get('/inventory');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('PATCH /inventory/:id deve atualizar nome e preço', async () => {
    const created = await request(app.getHttpServer())
      .post('/inventory')
      .send({ name: 'Filtro de óleo', unitOfMeasure: 'UNIT', unitPrice: 20, quantity: 10 });

    const response = await request(app.getHttpServer())
      .patch(`/inventory/${created.body.id}`)
      .send({ name: 'Filtro de óleo premium', unitPrice: 25 });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Filtro de óleo premium');
  });

  it('PATCH /inventory/:id/consume deve dar baixa no estoque', async () => {
    const created = await request(app.getHttpServer())
      .post('/inventory')
      .send({ name: 'Pastilha de freio', unitOfMeasure: 'UNIT', unitPrice: 80, quantity: 10 });

    const response = await request(app.getHttpServer())
      .patch(`/inventory/${created.body.id}/consume`)
      .send({ quantity: 4 });

    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(6);
  });

  it('DELETE /inventory/:id deve fazer soft delete', async () => {
    const created = await request(app.getHttpServer())
      .post('/inventory')
      .send({ name: 'Vela de ignição', unitOfMeasure: 'UNIT', unitPrice: 15, quantity: 8 });

    const response = await request(app.getHttpServer()).delete(`/inventory/${created.body.id}`);
    expect(response.status).toBe(204);

    const listResponse = await request(app.getHttpServer()).get('/inventory');
    const stillListed = listResponse.body.some((p: Part) => p.id === created.body.id);
    expect(stillListed).toBe(false);
  });
});
