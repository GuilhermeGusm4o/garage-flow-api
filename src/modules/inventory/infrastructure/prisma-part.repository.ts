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
    const row = await this.prisma.inventory.findUnique({ where: { id } });
    return row ? PartMapper.toDomain(row) : null;
  }

  async findAll(): Promise<Part[]> {
    const rows = await this.prisma.inventory.findMany({
      where: { deleted_at: null },
    });
    return rows.map(PartMapper.toDomain);
  }

  async findReservedQuantities(serviceOrderStatuses: string[]): Promise<Map<string, number>> {
    const rows = await this.prisma.serviceOrderInventory.groupBy({
      by: ['inventoryId'],
      where: {
        serviceOrder: {
          deleted_at: null,
          status: { in: serviceOrderStatuses as PrismaServiceOrderStatus[] },
        },
      },
      _sum: { quantity: true },
    });

    return new Map(rows.map((row) => [row.inventoryId, Number(row._sum.quantity ?? 0)]));
  }

  async findReservedQuantityForPart(
    partId: string,
    serviceOrderStatuses: string[],
  ): Promise<number> {
    const result = await this.prisma.serviceOrderInventory.aggregate({
      where: {
        inventoryId: partId,
        serviceOrder: {
          deleted_at: null,
          status: { in: serviceOrderStatuses as PrismaServiceOrderStatus[] },
        },
      },
      _sum: { quantity: true },
    });

    return Number(result._sum.quantity ?? 0);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.inventory.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
