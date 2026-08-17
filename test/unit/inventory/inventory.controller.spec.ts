import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { InventoryModule } from '../../../src/inventory/inventory.module';
import { PrismaModule } from '../../../src/infra/database/prisma/prisma.module';
import { PrismaService } from '../../../src/infra/database/prisma/prisma.service';
import { DomainExceptionFilter } from '../../../src/common/filters/domain-exception.filter';

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

  it('O comando POST /inventory deve criar uma peça', async () => {
    const response = await request(app.getHttpServer()).post('/inventory').send({
      name: 'Óleo de motor 5W30',
      unitOfMeasure: 'ML',
      unitPrice: 45.9,
      quantity: 20,
    });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Óleo de motor 5W30');
  });

  it('O comando POST /inventory deve rejeitar uma unidade de medida inválida', async () => {
    const response = await request(app.getHttpServer()).post('/inventory').send({
      name: 'Peça inválida',
      unitOfMeasure: 'LITROS',
      unitPrice: 10,
    });

    expect(response.status).toBe(400);
  });

  it('O comando GET /inventory deve listar as peças', async () => {
    const response = await request(app.getHttpServer()).get('/inventory');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
