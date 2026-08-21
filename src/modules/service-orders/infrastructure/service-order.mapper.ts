import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

export class ServiceOrderMapper {
  static toDomain(raw: any): ServiceOrder {
    const serviceItems = (raw.services ?? []).map(
      (s: any) => new ServiceItem(s.id, s.serviceId, Number(s.price)),
    );
    const partItems = (raw.inventory ?? []).map(
      (p: any) => new PartItem(p.id, p.inventoryId, Number(p.quantity), Number(p.unitPrice)),
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
