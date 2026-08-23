import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';
import { type ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type Prisma } from '@generated/prisma/client';

type ServiceOrderWithItems = Prisma.ServiceOrderGetPayload<{
  include: { services: true; inventory: true };
}>;

export class ServiceOrderMapper {
  static toDomain(raw: ServiceOrderWithItems): ServiceOrder {
    const serviceItems = raw.services.map(
      (service) => new ServiceItem(service.id, service.serviceId, Number(service.price)),
    );
    const partItems = raw.inventory.map(
      (part) =>
        new PartItem(part.id, part.inventoryId, Number(part.quantity), Number(part.unitPrice)),
    );

    return new ServiceOrder(
      raw.id,
      raw.vehicleId,
      raw.mechanicId,
      raw.status as ServiceOrderStatus,
      raw.approvedAt,
      Number(raw.totalAmount),
      serviceItems,
      partItems,
    );
  }

  static toPersistence(serviceOrder: ServiceOrder) {
    return {
      id: serviceOrder.id,
      vehicleId: serviceOrder.vehicleId,
      mechanicId: serviceOrder.mechanicId,
      status: serviceOrder.status,
      approvedAt: serviceOrder.approvedAt,
      totalAmount: serviceOrder.totalAmount,
    };
  }
}
