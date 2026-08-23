import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

@Injectable()
export class StartDiagnosisUseCase {
  constructor(private readonly serviceOrderRepository: ServiceOrderRepository) {}

  async execute(serviceOrderId: string, mechanicId: string): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrderRepository.findById(serviceOrderId);
    if (!serviceOrder) throw new NotFoundException('Service order not found');
    if (serviceOrder.status !== ServiceOrderStatus.RECEIVED) {
      throw new BadRequestException(
        'Only service orders with RECEIVED status can start a diagnosis',
      );
    }

    serviceOrder.startDiagnosis(mechanicId);

    await this.serviceOrderRepository.save(serviceOrder);
    return serviceOrder;
  }
}
