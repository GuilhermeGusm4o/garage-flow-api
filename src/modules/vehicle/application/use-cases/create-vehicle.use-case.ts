import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ClientRepository } from '@client/domain/repositories/client.repository';
import { VehicleRepository } from '@vehicle/domain/repositories/vehicle.repository';
import { VehicleEntity } from '@vehicle/domain/entities/vehicle.entity';
import {
  InvalidLicensePlateError,
  LicensePlate,
} from '@vehicle/domain/value-objects/license-plate.vo';

export interface CreateVehicleInput {
  brand: string;
  model: string;
  licensePlate: string;
  year: number;
  clientId: string;
}

@Injectable()
export class CreateVehicleUseCase {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(input: CreateVehicleInput): Promise<VehicleEntity> {
    const licensePlate = this.parseLicensePlate(input.licensePlate);

    const client = await this.clientRepository.findById(input.clientId);
    if (!client) {
      throw new NotFoundException(`Client with id ${input.clientId} not found`);
    }

    const existing = await this.vehicleRepository.findByLicensePlate(licensePlate.value);
    if (existing) {
      throw new ConflictException(`Vehicle with plate ${licensePlate.format()} already exists`);
    }

    const now = new Date();

    const vehicle = VehicleEntity.create({
      id: randomUUID(),
      brand: input.brand,
      model: input.model,
      licensePlate,
      year: input.year,
      clientId: input.clientId,
      createdAt: now,
      updatedAt: now,
    });

    return this.vehicleRepository.create(vehicle);
  }

  /** Traduz o erro de domínio do VO para o erro HTTP correspondente. */
  private parseLicensePlate(value: string): LicensePlate {
    try {
      return LicensePlate.create(value);
    } catch (error) {
      if (error instanceof InvalidLicensePlateError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
