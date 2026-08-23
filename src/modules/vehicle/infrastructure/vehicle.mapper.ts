import { type Vehicle as VehicleModel } from '@generated/prisma/client';
import { VehicleEntity } from '@vehicle/domain/entities/vehicle.entity';
import { LicensePlate } from '@vehicle/domain/value-objects/license-plate.vo';

export class VehicleMapper {
  static toDomain(raw: VehicleModel): VehicleEntity {
    return VehicleEntity.create({
      id: raw.id,
      brand: raw.brand,
      model: raw.model,
      licensePlate: LicensePlate.create(raw.licensePlate),
      year: raw.year,
      clientId: raw.clientId,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      deletedAt: raw.deleted_at,
    });
  }

  static toPrisma(entity: VehicleEntity): Omit<VehicleModel, 'created_at' | 'updated_at'> {
    return {
      id: entity.id,
      brand: entity.brand,
      model: entity.model,
      licensePlate: entity.licensePlate.value,
      year: entity.year,
      clientId: entity.clientId,
      deleted_at: entity.deletedAt,
    };
  }
}
