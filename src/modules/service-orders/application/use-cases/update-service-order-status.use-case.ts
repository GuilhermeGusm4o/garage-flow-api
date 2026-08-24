import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { UpdateServiceOrderStatusDto } from '@service-orders/presentation/dtos/update-service-order-status.dto';
import { WriteOffPartsUseCase } from '@inventory/application/use-cases/write-off-parts.use-case';

@Injectable()
export class UpdateServiceOrderStatusUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepository,
    private readonly writeOffParts: WriteOffPartsUseCase,
  ) {}

  async execute(id: string, dto: UpdateServiceOrderStatusDto): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);
    if (!serviceOrder) throw new NotFoundException('Service order not found');

    const isFinishing = serviceOrder.isFinishingWith(dto.status);

    serviceOrder.updateStatus(dto.status);

    if (isFinishing) {
      await this.writeOffParts.execute(
        serviceOrder.partItems.map((item) => ({
          inventoryId: item.inventoryId,
          quantity: item.quantity,
        })),
      );
    }

    await this.serviceOrderRepository.save(serviceOrder);
    return serviceOrder;
  }
}
