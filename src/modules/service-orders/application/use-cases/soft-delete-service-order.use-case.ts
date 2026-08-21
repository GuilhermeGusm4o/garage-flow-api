import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';

@Injectable()
export class SoftDeleteServiceOrderUseCase {
  constructor(private readonly serviceOrderRepository: ServiceOrderRepository) {}

  async execute(id: string): Promise<void> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);
    if (!serviceOrder) throw new NotFoundException('Service order not found');

    await this.serviceOrderRepository.softDelete(id);
  }
}
