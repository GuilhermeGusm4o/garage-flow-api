import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { Part } from '@inventory/domain/entities/part.entity';
import { PartRepository } from '@inventory/domain/repositories/part.repository';
import { PartMapper } from '@inventory/infrastructure/part.mapper';
import { type ServiceOrderStatus as PrismaServiceOrderStatus } from '@generated/prisma/client';

@Injectable()
export class PrismaPartRepository extends PartRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(part: Part): Promise<void> {
    const data = PartMapper.toPersistence(part);
    await this.prisma.inventory.upsert({
      where: { id: part.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Part | null> {
    const row = await this.prisma.inventory.findFirst({
      where: { id, deleted_at: null },
    });
    return row ? PartMapper.toDomain(row) : null;
  }

  async findByIds(ids: string[]): Promise<Part[]> {
    if (ids.length === 0) return [];

    const rows = await this.prisma.inventory.findMany({
      where: { id: { in: ids }, deleted_at: null },
    });
    return rows.map(PartMapper.toDomain);
  }

  async findAll(): Promise<Part[]> {
    const rows = await this.prisma.inventory.findMany({
      where: { deleted_at: null },
    });
    return rows.map(PartMapper.toDomain);
  }

  async findReservedQuantities(
    serviceOrderStatuses: string[],
    partIds?: string[],
  ): Promise<Map<string, number>> {
    const rows = await this.prisma.serviceOrderInventory.groupBy({
      by: ['inventoryId'],
      where: {
        ...(partIds ? { inventoryId: { in: partIds } } : {}),
        serviceOrder: {
          deleted_at: null,
          status: { in: serviceOrderStatuses as PrismaServiceOrderStatus[] },
        },
      },
      _sum: { quantity: true },
    });

    return new Map(rows.map((row) => [row.inventoryId, Number(row._sum.quantity ?? 0)]));
  }

  async findByIdList(idList: string[]): Promise<Part[]> {
    const rows = await this.prisma.inventory.findMany({
      where: { id: { in: idList }, deleted_at: null },
    });
    return rows.map(PartMapper.toDomain);
  }

  async findBelowMinimum(): Promise<Part[]> {
    const rows = await this.prisma.inventory.findMany({
      where: { deleted_at: null },
    });
    return rows.map(PartMapper.toDomain).filter((part: Part) => part.isBelowMinimum());
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.inventory.update({
      where: { id, deleted_at: null },
      data: { deleted_at: new Date() },
    });
  }
}
