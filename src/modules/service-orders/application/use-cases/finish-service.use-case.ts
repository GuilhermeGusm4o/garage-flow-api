import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';

@Injectable()
export class FinishServiceUseCase {
  constructor(private readonly serviceOrderRepository: ServiceOrderRepository) {}

  async execute(serviceOrderId: string, mechanicId: string): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrderRepository.findById(serviceOrderId);
    if (!serviceOrder) throw new NotFoundException('Service order not found');
    // ##TODO: relacionar com a baixa do estoque

    serviceOrder.finishService(mechanicId);
    await this.serviceOrderRepository.save(serviceOrder);
    return serviceOrder;
  }
}
