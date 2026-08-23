import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '@vehicle/domain/repositories/vehicle.repository';
import { VehicleEntity } from '@vehicle/domain/entities/vehicle.entity';

@Injectable()
export class FindAllVehiclesUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(): Promise<VehicleEntity[]> {
    return this.vehicleRepository.findAll();
  }
}
