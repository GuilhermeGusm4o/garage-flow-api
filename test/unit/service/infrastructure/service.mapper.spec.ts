import { ServiceMapper } from '@service/infrastructure/service.mapper';
import { ServiceEntity } from '@service/domain/entities/service.entity';
import { ServicePrice } from '@service/domain/value-objects/service-price.value-object';
import { Decimal } from '@prisma/client/runtime/client';
import { type Service as PrismaService } from '@generated/prisma/client';
import { type UUID } from 'crypto';

describe('ServiceMapper', () => {
  const prismaService: PrismaService = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Troca de óleo',
    price: new Decimal('150.5'),
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-02'),
    deleted_at: null,
  };

  describe('toDomain', () => {
    it('should map a Prisma service to a domain entity', () => {
      const result = ServiceMapper.toDomain(prismaService);

      expect(result).toBeInstanceOf(ServiceEntity);
      expect(result.id).toBe(prismaService.id);
      expect(result.name).toBe(prismaService.name);
      expect(result.price.getValue()).toBe(150.5);
      expect(result.createdAt).toBe(prismaService.created_at);
      expect(result.updatedAt).toBe(prismaService.updated_at);
      expect(result.deletedAt).toBeNull();
    });

    it('should preserve a non-null deleted_at', () => {
      const deletedAt = new Date('2024-02-01');
      const result = ServiceMapper.toDomain({ ...prismaService, deleted_at: deletedAt });

      expect(result.deletedAt).toBe(deletedAt);
    });
  });

  describe('toPrisma', () => {
    it('should map a domain entity to the Prisma persistence shape', () => {
      const entity = ServiceEntity.create({
        id: '123e4567-e89b-12d3-a456-426614174000' as UUID,
        name: 'Alinhamento',
        price: ServicePrice.create(200.75),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
      });

      const result = ServiceMapper.toPrisma(entity);

      expect(result.id).toBe(entity.id);
      expect(result.name).toBe('Alinhamento');
      expect(result.price).toBeInstanceOf(Decimal);
      expect(result.price.equals(new Decimal('200.75'))).toBe(true);
      expect(result.deleted_at).toBeNull();
    });

    it('should carry over deleted_at when the entity is soft deleted', () => {
      const entity = ServiceEntity.create({
        id: '123e4567-e89b-12d3-a456-426614174000' as UUID,
        name: 'Alinhamento',
        price: ServicePrice.create(100),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
      });
      entity.softDelete();

      const result = ServiceMapper.toPrisma(entity);

      expect(result.deleted_at).toBe(entity.deletedAt);
    });
  });
});
