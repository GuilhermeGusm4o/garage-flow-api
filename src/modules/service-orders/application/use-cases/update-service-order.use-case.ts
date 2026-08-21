import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { UpdateServiceOrderDto } from '@service-orders/presentation/dtos/update-service-order.dto';

@Injectable()
export class UpdateServiceOrderUseCase {
  constructor(private readonly serviceOrderRepository: ServiceOrderRepository) {}

  async execute(id: string, dto: UpdateServiceOrderDto): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);
    if (!serviceOrder) throw new NotFoundException('Service order not found');

    if (dto.status !== undefined) {
      serviceOrder.updateStatus(dto.status);
    }

    await this.serviceOrderRepository.save(serviceOrder);
    return serviceOrder;
  }
}
