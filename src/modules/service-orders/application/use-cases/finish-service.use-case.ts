import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

@Injectable()
export class FinishServiceUseCase {
  constructor(private readonly serviceOrderRepository: ServiceOrderRepository) {}

  async execute(serviceOrderId: string, mechanicId: string): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrderRepository.findById(serviceOrderId);
    if (!serviceOrder) throw new NotFoundException('Service order not found');

    if (serviceOrder.mechanicId !== mechanicId) {
      throw new ForbiddenException('Only the mechanic assigned to the service order can finish it');
    }

    if (serviceOrder.status !== ServiceOrderStatus.IN_EXECUTION) {
      throw new BadRequestException('Only service orders in execution can be finished');
    }

    serviceOrder.finishService(mechanicId);
    await this.serviceOrderRepository.save(serviceOrder);
    return serviceOrder;
  }
}
