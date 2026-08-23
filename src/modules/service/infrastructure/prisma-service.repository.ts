import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma/prisma.service';
import { ServiceRepository } from '@service/domain/repositories/service.repository';
import { ServiceEntity } from '@service/domain/entities/service.entity';
import { ServiceMapper } from '@service/infrastructure/service.mapper';

@Injectable()
export class PrismaServiceRepository implements ServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(service: ServiceEntity): Promise<ServiceEntity> {
    const raw = await this.prisma.service.create({
      data: ServiceMapper.toPrisma(service),
    });
    return ServiceMapper.toDomain(raw);
  }

  async findAll(): Promise<ServiceEntity[]> {
    const raws = await this.prisma.service.findMany({
      where: { deleted_at: null },
    });
    return raws.map(ServiceMapper.toDomain);
  }

  async findById(id: string): Promise<ServiceEntity | null> {
    const raw = await this.prisma.service.findFirst({
      where: { id, deleted_at: null },
    });
    if (!raw) return null;
    return ServiceMapper.toDomain(raw);
  }

  async update(service: ServiceEntity): Promise<ServiceEntity> {
    const raw = await this.prisma.service.update({
      where: { id: service.id },
      data: ServiceMapper.toPrisma(service),
    });
    return ServiceMapper.toDomain(raw);
  }

  async findByIdList(idList: string[]): Promise<ServiceEntity[]> {
    const raws = await this.prisma.service.findMany({
      where: { id: { in: idList }, deleted_at: null },
    });
    return raws.map(ServiceMapper.toDomain);
  }
}
