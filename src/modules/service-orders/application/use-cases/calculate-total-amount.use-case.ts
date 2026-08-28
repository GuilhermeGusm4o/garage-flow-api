import { Injectable } from '@nestjs/common';
import { type ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { type PartItem } from '@service-orders/domain/entities/part-item.entity';

@Injectable()
export class CalculateTotalAmountUseCase {
  async execute(serviceItems: ServiceItem[], partItems: PartItem[]): Promise<number> {
    const servicesTotal = serviceItems.reduce((total, item) => total + item.price, 0);

    const partsTotal = partItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);

    return servicesTotal + partsTotal;
  }
}
