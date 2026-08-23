import { type ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { type ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { type PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

export interface ServiceOrderListItem {
  id: string;
  vehicleId: string;
  description: string;
  mechanicId: string | null;
  status: ServiceOrder['status'];
  approvedAt: Date | null;
  totalAmount: number;
  serviceItems: ServiceItem[];
  partItems: PartItem[];
  vehicleLicensePlate: string;
  clientName: string;
  vehicleBrand: string;
  vehicleModel: string;
}

export abstract class ServiceOrderRepository {
  abstract save(serviceOrder: ServiceOrder): Promise<ServiceOrder>;
  abstract findById(id: string): Promise<ServiceOrder | null>;
  abstract findAll(status?: ServiceOrderStatus, mechanicId?: string): Promise<ServiceOrderListItem[]>;
  abstract softDelete(id: string): Promise<void>;
}
