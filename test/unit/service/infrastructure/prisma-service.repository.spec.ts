import { PrismaServiceRepository } from '@service/infrastructure/prisma-service.repository';
import { ServiceEntity } from '@service/domain/entities/service.entity';
import { ServicePrice } from '@service/domain/value-objects/service-price.value-object';
import { Decimal } from '@prisma/client/runtime/client';
import { type UUID } from 'crypto';

const mockId = '123e4567-e89b-12d3-a456-426614174000' as UUID;

const makePrismaRow = (overrides = {}) => ({
  id: mockId,
  name: 'Troca de óleo',
  price: new Decimal('150'),
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  deleted_at: null,
  ...overrides,
});

const makeEntity = (): ServiceEntity =>
  ServiceEntity.create({
    id: mockId,
    name: 'Troca de óleo',
    price: ServicePrice.create(150),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  });

describe('PrismaServiceRepository', () => {
  let repository: PrismaServiceRepository;
  let prisma: {
    service: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      service: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    repository = new PrismaServiceRepository(prisma as never);
  });

  describe('create', () => {
    it('should persist the entity and return the mapped domain entity', async () => {
      prisma.service.create.mockResolvedValue(makePrismaRow());

      const result = await repository.create(makeEntity());

      expect(prisma.service.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: mockId,
          name: 'Troca de óleo',
          price: expect.any(Decimal),
        }),
      });
      expect(result).toBeInstanceOf(ServiceEntity);
      expect(result.id).toBe(mockId);
      expect(result.price.getValue()).toBe(150);
    });
  });

  describe('findAll', () => {
    it('should return only non-deleted services mapped to domain entities', async () => {
      prisma.service.findMany.mockResolvedValue([makePrismaRow()]);

      const result = await repository.findAll();

      expect(prisma.service.findMany).toHaveBeenCalledWith({
        where: { deleted_at: null },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ServiceEntity);
    });

    it('should return an empty array when there are no services', async () => {
      prisma.service.findMany.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return the mapped entity when found', async () => {
      prisma.service.findFirst.mockResolvedValue(makePrismaRow());

      const result = await repository.findById(mockId);

      expect(prisma.service.findFirst).toHaveBeenCalledWith({
        where: { id: mockId, deleted_at: null },
      });
      expect(result).toBeInstanceOf(ServiceEntity);
      expect(result?.id).toBe(mockId);
    });

    it('should return null when not found', async () => {
      prisma.service.findFirst.mockResolvedValue(null);

      const result = await repository.findById(mockId);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should persist changes and return the mapped domain entity', async () => {
      const entity = makeEntity();
      entity.update('Alinhamento', ServicePrice.create(200));
      prisma.service.update.mockResolvedValue(
        makePrismaRow({ name: 'Alinhamento', price: new Decimal('200') }),
      );

      const result = await repository.update(entity);

      expect(prisma.service.update).toHaveBeenCalledWith({
        where: { id: entity.id },
        data: expect.objectContaining({ name: 'Alinhamento' }),
      });
      expect(result.name).toBe('Alinhamento');
      expect(result.price.getValue()).toBe(200);
    });
  });

  describe('findByIdList', () => {
    it('should return mapped entities for the given list of ids', async () => {
      const service1 = makePrismaRow({ id: 'id-1' });
      const service2 = makePrismaRow({ id: 'id-2' });
      prisma.service.findMany.mockResolvedValue([service1, service2]);

      const result = await repository.findByIdList(['id-1', 'id-2']);
      expect(prisma.service.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['id-1', 'id-2'] }, deleted_at: null },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ServiceEntity);
      expect(result[1]).toBeInstanceOf(ServiceEntity);
    });
  });
});
