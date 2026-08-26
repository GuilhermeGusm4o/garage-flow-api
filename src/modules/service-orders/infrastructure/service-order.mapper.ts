import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';
import { type ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import {
  type ServiceOrder as PrismaServiceOrder,
  type ServiceOrderService as PrismaServiceOrderService,
  type ServiceOrderInventory as PrismaServiceOrderInventory,
  type Inventory as PrismaInventory,
} from '@generated/prisma/client';

type PrismaServiceOrderWithRelations = PrismaServiceOrder & {
  services: PrismaServiceOrderService[];
  inventory: (PrismaServiceOrderInventory & { inventory: PrismaInventory })[];
};

export class ServiceOrderMapper {
  static toDomain(raw: PrismaServiceOrderWithRelations): ServiceOrder {
    const serviceItems = raw.services.map(
      (s) => new ServiceItem(s.id, s.serviceId, Number(s.price)),
    );
    const partItems = raw.inventory.map(
      (p) =>
        new PartItem(
          p.id,
          p.inventoryId,
          Number(p.quantity),
          Number(p.unitPrice),
          p.inventory.unitOfMeasure,
        ),
    );

    return new ServiceOrder(
      raw.id,
      raw.vehicleId,
      raw.description,
      raw.mechanicId,
      raw.status as ServiceOrderStatus,
      raw.approvedAt,
      Number(raw.totalAmount),
      serviceItems,
      partItems,
      raw.serviceStartedAt,
      raw.serviceFinishedAt,
      raw.updated_at,
      raw.deleted_at,
    );
  }

  static toPersistence(serviceOrder: ServiceOrder) {
    return {
      id: serviceOrder.id,
      vehicleId: serviceOrder.vehicleId,
      description: serviceOrder.description,
      mechanicId: serviceOrder.mechanicId,
      status: serviceOrder.status,
      approvedAt: serviceOrder.approvedAt,
      totalAmount: serviceOrder.totalAmount,
      serviceStartedAt: serviceOrder.serviceStartedAt,
      serviceFinishedAt: serviceOrder.serviceFinishedAt,
    };
  }
}
