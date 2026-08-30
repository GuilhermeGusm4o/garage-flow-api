import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { VehicleRepository } from '@vehicle/domain/repositories/vehicle.repository';
import { VehicleEntity } from '@vehicle/domain/entities/vehicle.entity';
import { VehicleMapper } from '@vehicle/infrastructure/vehicle.mapper';

@Injectable()
export class PrismaVehicleRepository implements VehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(vehicle: VehicleEntity): Promise<VehicleEntity> {
    const raw = await this.prisma.vehicle.create({
      data: VehicleMapper.toPrisma(vehicle),
    });
    return VehicleMapper.toDomain(raw);
  }

  async findAll(): Promise<VehicleEntity[]> {
    const raws = await this.prisma.vehicle.findMany({
      where: { deleted_at: null },
    });
    return raws.map(VehicleMapper.toDomain);
  }

  async findById(id: string): Promise<VehicleEntity | null> {
    const raw = await this.prisma.vehicle.findFirst({
      where: { id, deleted_at: null },
    });
    if (!raw) return null;
    return VehicleMapper.toDomain(raw);
  }

  async findByLicensePlate(licensePlate: string): Promise<VehicleEntity | null> {
    const raw = await this.prisma.vehicle.findFirst({
      where: { licensePlate, deleted_at: null },
    });
    if (!raw) return null;
    return VehicleMapper.toDomain(raw);
  }

  async update(vehicle: VehicleEntity): Promise<VehicleEntity> {
    const raw = await this.prisma.vehicle.update({
      where: { id: vehicle.id },
      data: VehicleMapper.toPrisma(vehicle),
    });
    return VehicleMapper.toDomain(raw);
  }
}
