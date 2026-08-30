import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaPartRepository } from '@inventory/infrastructure/prisma-part.repository';
import { truncateAllTables } from '../../../support/truncate-database';

describe('PrismaPartRepository (integration)', () => {
  let prisma: PrismaService;
  let repository: PrismaPartRepository;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new PrismaPartRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await truncateAllTables(prisma);
  });

  describe('findBelowMinimum', () => {
    it('devolve apenas as peças cuja quantidade está abaixo do mínimo', async () => {
      await prisma.inventory.create({
        data: {
          name: 'Óleo em falta',
          unitOfMeasure: 'ML',
          unitPrice: 30,
          quantity: 1,
          minQuantity: 5,
        },
      });
      await prisma.inventory.create({
        data: {
          name: 'Filtro em estoque',
          unitOfMeasure: 'UNIT',
          unitPrice: 10,
          quantity: 20,
          minQuantity: 5,
        },
      });

      const result = await repository.findBelowMinimum();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Óleo em falta');
    });

    it('ignora peças soft-deletadas', async () => {
      await prisma.inventory.create({
        data: {
          name: 'Peça removida',
          unitOfMeasure: 'UNIT',
          unitPrice: 10,
          quantity: 1,
          minQuantity: 5,
          deleted_at: new Date(),
        },
      });

      await expect(repository.findBelowMinimum()).resolves.toEqual([]);
    });
  });
});
