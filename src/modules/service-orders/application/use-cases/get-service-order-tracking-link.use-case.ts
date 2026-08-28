import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { buildTrackingLink } from '@service-orders/infrastructure/security/tracking-token.util';

@Injectable()
export class GetServiceOrderTrackingLinkUseCase {
  constructor(private readonly serviceOrderRepository: ServiceOrderRepository) {}

  async execute(baseUrl: string, serviceOrderId: string): Promise<string> {
    const serviceOrder = await this.serviceOrderRepository.findById(serviceOrderId);
    if (!serviceOrder) throw new NotFoundException('Service order not found');
    return buildTrackingLink(baseUrl, serviceOrder.id);
  }
}
