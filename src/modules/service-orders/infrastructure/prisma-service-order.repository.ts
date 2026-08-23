import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { ServiceOrderMapper } from '@service-orders/infrastructure/service-order.mapper';

@Injectable()
export class PrismaServiceOrderRepository implements ServiceOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(serviceOrder: ServiceOrder): Promise<ServiceOrder> {
    const data = ServiceOrderMapper.toPersistence(serviceOrder);

    const raw = await this.prisma.$transaction(async (tx) => {
      await tx.serviceOrder.upsert({
        where: { id: serviceOrder.id },
        create: data,
        update: data,
      });

      await tx.serviceOrderService.deleteMany({ where: { serviceOrderId: serviceOrder.id } });
      if (serviceOrder.serviceItems.length > 0) {
        await tx.serviceOrderService.createMany({
          data: serviceOrder.serviceItems.map((item) => ({
            serviceId: item.serviceId,
            serviceOrderId: serviceOrder.id,
            price: item.price,
          })),
        });
      }

      await tx.serviceOrderInventory.deleteMany({ where: { serviceOrderId: serviceOrder.id } });
      if (serviceOrder.partItems.length > 0) {
        await tx.serviceOrderInventory.createMany({
          data: serviceOrder.partItems.map((item) => ({
            inventoryId: item.inventoryId,
            serviceOrderId: serviceOrder.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        });
      }

      return tx.serviceOrder.findUniqueOrThrow({
        where: { id: serviceOrder.id },
        include: { services: true, inventory: true },
      });
    });
    return ServiceOrderMapper.toDomain(raw);
  }

  async findById(id: string): Promise<ServiceOrder | null> {
    const raw = await this.prisma.serviceOrder.findFirst({
      where: { id, deleted_at: null },
      include: { services: true, inventory: true },
    });
    if (!raw) return null;
    return ServiceOrderMapper.toDomain(raw);
  }

  async findAll(): Promise<ServiceOrder[]> {
    const raws = await this.prisma.serviceOrder.findMany({
      where: { deleted_at: null },
      include: { services: true, inventory: true },
    });
    return raws.map(ServiceOrderMapper.toDomain);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.serviceOrder.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
