import { Injectable } from '@nestjs/common';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';

@Injectable()
export class FindAllServiceOrdersUseCase {
  constructor(private readonly serviceOrderRepository: ServiceOrderRepository) {}

  async execute(): Promise<ServiceOrder[]> {
    return this.serviceOrderRepository.findAll();
  }
}
