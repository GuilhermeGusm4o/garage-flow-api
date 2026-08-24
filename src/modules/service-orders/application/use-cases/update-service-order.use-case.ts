import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { UpdateServiceOrderDto } from '@service-orders/presentation/dtos/update-service-order.dto';
import { WriteOffPartsUseCase } from '@inventory/application/use-cases/write-off-parts.use-case';

@Injectable()
export class UpdateServiceOrderUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepository,
    private readonly writeOffParts: WriteOffPartsUseCase,
  ) {}

  async execute(id: string, dto: UpdateServiceOrderDto): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);
    if (!serviceOrder) throw new NotFoundException('Service order not found');

    const isFinishing = serviceOrder.isFinishingWith(dto.status);

    serviceOrder.update({
      vehicleId: dto.vehicleId,
      mechanicId: dto.mechanicId,
      status: dto.status,
      approvedAt: dto.approvedAt !== undefined ? this.toDate(dto.approvedAt) : undefined,
    });

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

  private toDate(value: string | null): Date | null {
    return value === null ? null : new Date(value);
  }
}
