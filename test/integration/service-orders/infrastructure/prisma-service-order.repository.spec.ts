import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaServiceOrderRepository } from '@service-orders/infrastructure/prisma-service-order.repository';
import { truncateAllTables } from '../../../support/truncate-database';

describe('PrismaServiceOrderRepository (integration)', () => {
  let prisma: PrismaService;
  let repository: PrismaServiceOrderRepository;
  let vehicleId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new PrismaServiceOrderRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
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

    // 60 minutos, finalizada em 01/08
    await prisma.serviceOrder.create({
      data: {
        vehicleId,
        description: 'OS 1',
        status: 'FINISHED',
        totalAmount: 100,
        serviceStartedAt: new Date('2026-08-01T10:00:00.000Z'),
        serviceFinishedAt: new Date('2026-08-01T11:00:00.000Z'),
      },
    });
    // 180 minutos, entregue em 15/08
    await prisma.serviceOrder.create({
      data: {
        vehicleId,
        description: 'OS 2',
        status: 'DELIVERED',
        totalAmount: 100,
        serviceStartedAt: new Date('2026-08-15T10:00:00.000Z'),
        serviceFinishedAt: new Date('2026-08-15T13:00:00.000Z'),
      },
    });
    // 30 minutos, finalizada em 01/09 (fora da janela de agosto)
    await prisma.serviceOrder.create({
      data: {
        vehicleId,
        description: 'OS 3',
        status: 'FINISHED',
        totalAmount: 100,
        serviceStartedAt: new Date('2026-09-01T10:00:00.000Z'),
        serviceFinishedAt: new Date('2026-09-01T10:30:00.000Z'),
      },
    });
    // ainda em execução: sem service_finished_at, não deve entrar na média
    await prisma.serviceOrder.create({
      data: {
        vehicleId,
        description: 'OS 4',
        status: 'IN_EXECUTION',
        totalAmount: 100,
        serviceStartedAt: new Date('2026-08-20T10:00:00.000Z'),
      },
    });
  });

  it('calcula a média sem filtros de data considerando todas as OS concluídas', async () => {
    const result = await repository.findAverageExecutionTime();

    expect(result.completedServiceOrders).toBe(3);
    expect(result.averageExecutionTimeMinutes).toBeCloseTo((60 + 180 + 30) / 3);
  });

  it('aplica somente o filtro "from" quando "to" não é informado', async () => {
    const result = await repository.findAverageExecutionTime(new Date('2026-08-20T00:00:00.000Z'));

    expect(result.completedServiceOrders).toBe(1);
    expect(result.averageExecutionTimeMinutes).toBeCloseTo(30);
  });

  it('aplica somente o filtro "to" quando "from" não é informado', async () => {
    const result = await repository.findAverageExecutionTime(
      undefined,
      new Date('2026-08-10T00:00:00.000Z'),
    );

    expect(result.completedServiceOrders).toBe(1);
    expect(result.averageExecutionTimeMinutes).toBeCloseTo(60);
  });

  it('aplica os filtros "from" e "to" combinados', async () => {
    const result = await repository.findAverageExecutionTime(
      new Date('2026-08-01T00:00:00.000Z'),
      new Date('2026-09-01T00:00:00.000Z'),
    );

    expect(result.completedServiceOrders).toBe(2);
    expect(result.averageExecutionTimeMinutes).toBeCloseTo((60 + 180) / 2);
  });

  it('devolve média nula quando nenhuma OS concluída está no período', async () => {
    const result = await repository.findAverageExecutionTime(
      new Date('2027-01-01T00:00:00.000Z'),
      new Date('2027-02-01T00:00:00.000Z'),
    );

    expect(result.completedServiceOrders).toBe(0);
    expect(result.averageExecutionTimeMinutes).toBeNull();
  });
});
