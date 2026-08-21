import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';

export class ServiceOrder {
  constructor(
    public readonly id: string,
    public vehicleId: string,
    public mechanicId: string | null,
    public status: ServiceOrderStatus,
    public approvedAt: Date | null,
    public totalAmount: number,
    public serviceItems: ServiceItem[],
    public partItems: PartItem[],
  ) {}

  static create(
    vehicleId: string,
    serviceItems: ServiceItem[],
    partItems: PartItem[],
  ): ServiceOrder {
    const totalAmount = ServiceOrder.calculateTotal(serviceItems, partItems);
    return new ServiceOrder(
      crypto.randomUUID(),
      vehicleId,
      null,
      ServiceOrderStatus.RECEIVED,
      null,
      totalAmount,
      serviceItems,
      partItems,
    );
  }

  private static calculateTotal(serviceItems: ServiceItem[], partItems: PartItem[]): number {
    const servicesTotal = serviceItems.reduce((acc, item) => acc + item.price, 0);
    const partsTotal = partItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    return servicesTotal + partsTotal;
  }

  updateStatus(newStatus: ServiceOrderStatus): void {
    this.status = newStatus;
  }
}
