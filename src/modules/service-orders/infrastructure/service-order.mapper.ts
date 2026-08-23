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
    const serviceItems = raw.services.map((s) =>
      ServiceItem.reconstitute({
        id: s.id,
        serviceId: s.serviceId,
        price: Number(s.price),
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      }),
    );
    const partItems = raw.inventory.map((p) =>
      PartItem.reconstitute({
        id: p.id,
        inventoryId: p.inventoryId,
        quantity: Number(p.quantity),
        unitPrice: Number(p.unitPrice),
        unitOfMeasure: p.inventory.unitOfMeasure,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }),
    );

    return ServiceOrder.reconstitute({
      id: raw.id,
      vehicleId: raw.vehicleId,
      description: raw.description,
      mechanicId: raw.mechanicId,
      status: raw.status as ServiceOrderStatus,
      approvedAt: raw.approvedAt,
      totalAmount: Number(raw.totalAmount),
      serviceItems,
      partItems,
      serviceStartedAt: raw.serviceStartedAt,
      serviceFinishedAt: raw.serviceFinishedAt,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      deletedAt: raw.deleted_at,
    });
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
      deleted_at: serviceOrder.deletedAt,
    };
  }
}
