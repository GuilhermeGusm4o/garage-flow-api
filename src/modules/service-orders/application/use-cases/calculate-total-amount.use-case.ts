import { Injectable } from '@nestjs/common';
import { type ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { type PartItem } from '@service-orders/domain/entities/part-item.entity';
import { FindServicesByIdListUseCase } from '@service/application/use-cases/find-services-by-id-list.use-case';

@Injectable()
export class CalculateTotalAmountUseCase {
  constructor(private readonly findServicesByIdList: FindServicesByIdListUseCase) {}

  async execute(serviceItems: ServiceItem[], partItems: PartItem[]): Promise<number> {
    const services =
      serviceItems.length > 0
        ? await this.findServicesByIdList.execute(serviceItems.map((item) => item.serviceId))
        : [];

    const servicesTotal = serviceItems.reduce((total, item) => {
      const service = services.find((s) => s.id === item.serviceId);
      const servicePrice = service ? service.price.getValue() : 0;
      return total + item.price + servicePrice;
    }, 0);

    const partsTotal = partItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);

    return servicesTotal + partsTotal;
  }
}
