import { randomUUID, type UUID } from 'crypto';
import { VehicleEntity } from '@vehicle/domain/entities/vehicle.entity';
import { LicensePlate } from '@vehicle/domain/value-objects/license-plate.vo';
import { type VehicleRepository } from '@vehicle/domain/repositories/vehicle.repository';

/** Data fixa no passado para que `touch()` sempre produza um `updatedAt` maior. */
export const FIXED_DATE = new Date('2026-01-01T00:00:00.000Z');

export interface MakeVehicleOverrides {
  id?: UUID;
  brand?: string;
  model?: string;
  licensePlate?: string;
  year?: number;
  clientId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export function makeVehicle(overrides: MakeVehicleOverrides = {}): VehicleEntity {
  return VehicleEntity.create({
    id: overrides.id ?? randomUUID(),
    brand: overrides.brand ?? 'Volkswagen',
    model: overrides.model ?? 'Gol',
    licensePlate: LicensePlate.create(overrides.licensePlate ?? 'ABC1D23'),
    year: overrides.year ?? 2020,
    clientId: overrides.clientId ?? randomUUID(),
    createdAt: overrides.createdAt ?? FIXED_DATE,
    updatedAt: overrides.updatedAt ?? FIXED_DATE,
    deletedAt: overrides.deletedAt ?? null,
  });
}

export function makeVehicleRepositoryMock(): jest.Mocked<VehicleRepository> {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByLicensePlate: jest.fn(),
    update: jest.fn(),
  };
}
