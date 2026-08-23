import { type VehicleEntity } from '@vehicle/domain/entities/vehicle.entity';

export abstract class VehicleRepository {
  abstract create(vehicle: VehicleEntity): Promise<VehicleEntity>;
  abstract findAll(): Promise<VehicleEntity[]>;
  abstract findById(id: string): Promise<VehicleEntity | null>;
  abstract findByLicensePlate(licensePlate: string): Promise<VehicleEntity | null>;
  abstract update(vehicle: VehicleEntity): Promise<VehicleEntity>;
}
