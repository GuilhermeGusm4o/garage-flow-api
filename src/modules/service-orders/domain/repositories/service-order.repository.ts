import { type ServiceOrder } from '@service-orders/domain/entities/service-order.entity';

export abstract class ServiceOrderRepository {
  abstract save(serviceOrder: ServiceOrder): Promise<ServiceOrder>;
  abstract findById(id: string): Promise<ServiceOrder | null>;
  abstract findAll(): Promise<ServiceOrder[]>;
  abstract softDelete(id: string): Promise<void>;
}
