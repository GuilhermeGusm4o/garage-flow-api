import { Injectable } from '@nestjs/common';
import {
  ServiceOrderListItem,
  ServiceOrderRepository,
} from '@service-orders/domain/repositories/service-order.repository';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

@Injectable()
export class FindAllServiceOrdersUseCase {
  constructor(private readonly serviceOrderRepository: ServiceOrderRepository) {}

  async execute(status?: ServiceOrderStatus, mechanicId?: string): Promise<ServiceOrderListItem[]> {
    return this.serviceOrderRepository.findAll(status, mechanicId);
  }
}
