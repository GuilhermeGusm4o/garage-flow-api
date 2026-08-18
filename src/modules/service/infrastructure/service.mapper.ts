import { type Service as PrismaService } from '@generated/prisma/client';
import { Decimal } from '@prisma/client/runtime/client';
import { type UUID } from 'crypto';
import { ServiceEntity } from '@service/domain/entities/service.entity';
import { ServicePrice } from '@service/domain/value-objects/service-price.value-object';

export class ServiceMapper {
  static toDomain(raw: PrismaService): ServiceEntity {
    return ServiceEntity.create({
      id: raw.id as UUID,
      name: raw.name,
      price: ServicePrice.create(raw.price.toNumber()),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      deletedAt: raw.deleted_at,
    });
  }

  static toPrisma(entity: ServiceEntity): Omit<PrismaService, 'created_at' | 'updated_at'> {
    return {
      id: entity.id,
      name: entity.name,
      price: new Decimal(entity.price.getValue()),
      deleted_at: entity.deletedAt,
    };
  }
}
