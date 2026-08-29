import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { WriteOffPartsUseCase } from '@inventory/application/use-cases/write-off-parts.use-case';

@Injectable()
export class FinishServiceUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepository,
    private readonly writeOffParts: WriteOffPartsUseCase,
  ) {}

  async execute(serviceOrderId: string, mechanicId: string): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrderRepository.findById(serviceOrderId);
    if (!serviceOrder) throw new NotFoundException('Service order not found');
    serviceOrder.finishService(mechanicId);
    await this.writeOffParts.execute(
      serviceOrder.partItems.map((item) => ({
        inventoryId: item.inventoryId,
        quantity: item.quantity,
      })),
    );
    await this.serviceOrderRepository.save(serviceOrder);
    return serviceOrder;
  }
}
