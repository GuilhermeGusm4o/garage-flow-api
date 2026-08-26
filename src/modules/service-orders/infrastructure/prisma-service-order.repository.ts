import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { ServiceOrderMapper } from '@service-orders/infrastructure/service-order.mapper';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';

@Injectable()
export class PrismaServiceOrderRepository implements ServiceOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(serviceOrder: ServiceOrder): Promise<ServiceOrder> {
    const data = ServiceOrderMapper.toPersistence(serviceOrder);

    const raw = await this.prisma.$transaction(async (tx) => {
      await tx.serviceOrder.upsert({
        where: { id: serviceOrder.id, deleted_at: null },
        create: data,
        update: data,
      });

      await this.deleteAndCreateServiceItems(tx, serviceOrder.id, serviceOrder.serviceItems);
      await this.deleteAndCreatePartItems(tx, serviceOrder.id, serviceOrder.partItems);

      return tx.serviceOrder.findUniqueOrThrow({
        where: { id: serviceOrder.id, deleted_at: null },
        include: { services: true, inventory: { include: { inventory: true } } },
      });
    });
    return ServiceOrderMapper.toDomain(raw);
  }

  async findById(id: string): Promise<ServiceOrder | null> {
    const raw = await this.prisma.serviceOrder.findFirst({
      where: { id, deleted_at: null },
      include: { services: true, inventory: { include: { inventory: true } } },
    });
    if (!raw) return null;
    return ServiceOrderMapper.toDomain(raw);
  }

  async findAll(): Promise<ServiceOrder[]> {
    const raws = await this.prisma.serviceOrder.findMany({
      where: { deleted_at: null },
      include: { services: true, inventory: { include: { inventory: true } } },
    });
    return raws.map(ServiceOrderMapper.toDomain);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.serviceOrder.update({
      where: { id, deleted_at: null },
      data: { deleted_at: new Date() },
    });
  }

  private async deleteAndCreateServiceItems(
    tx: any,
    serviceOrderId: string,
    serviceItems: ServiceItem[],
  ): Promise<void> {
    await tx.serviceOrderService.deleteMany({ where: { serviceOrderId } });
    if (serviceItems.length > 0) {
      await tx.serviceOrderService.createMany({
        data: serviceItems.map((item) => ({
          serviceId: item.serviceId,
          serviceOrderId,
          price: item.price,
        })),
      });
    }
  }

  private async deleteAndCreatePartItems(
    tx: any,
    serviceOrderId: string,
    partItems: PartItem[],
  ): Promise<void> {
    await tx.serviceOrderInventory.deleteMany({ where: { serviceOrderId } });
    if (partItems.length > 0) {
      await tx.serviceOrderInventory.createMany({
        data: partItems.map((item) => ({
          inventoryId: item.inventoryId,
          serviceOrderId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
    }
  }
}
