import { Injectable, BadRequestException } from '@nestjs/common';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { CreateServiceOrderDto } from '@service-orders/presentation/dtos/create-service-order.dto';
import { FindClientByCpfCnpjUseCase } from '@client/application/use-cases/find-client-by-cpf-cnpj.use-case';
import { FindVehicleByLicensePlateUseCase } from '@vehicle/application/use-cases/find-vehicle-by-license-plate.use-case';
import { FindPartByIdUseCase } from '@inventory/application/use-cases/find-part-by-id.use-case';
import { CalculateAvailabilityUseCase } from '@inventory/application/use-cases/calculate-availability.use-case';
import { FindServicesByIdListUseCase } from '@service/application/use-cases/find-services-by-id-list.use-case';

@Injectable()
export class CreateServiceOrderUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepository,
    private readonly findClientByCpfCnpj: FindClientByCpfCnpjUseCase,
    private readonly findVehicleByLicensePlate: FindVehicleByLicensePlateUseCase,
    private readonly findPartById: FindPartByIdUseCase,
    private readonly calculateAvailability: CalculateAvailabilityUseCase,
    private readonly findServicesByIdList: FindServicesByIdListUseCase,
  ) {}

  async execute(dto: CreateServiceOrderDto): Promise<ServiceOrder> {
    const client = await this.findClientByCpfCnpj.execute(dto.clientCpfCnpj);

    const vehicle = await this.findVehicleByLicensePlate.execute(dto.licensePlate);
    if (vehicle.clientId !== client.id) {
      throw new BadRequestException('Veículo não pertence ao cliente informado');
    }

    const services =
      dto.services.length > 0
        ? await this.findServicesByIdList.execute(dto.services.map((item) => item.serviceId))
        : [];
    const serviceItems = services.map(
      (service) => new ServiceItem(null, service.id, service.price.getValue()),
    );

    const partItems: PartItem[] = [];
    for (const item of dto.parts) {
      const part = await this.findPartById.execute(item.inventoryId);
      const available = await this.calculateAvailability.execute(item.inventoryId);

      if (item.quantity > available) {
        throw new BadRequestException(
          `Quantidade indisponível para a peça ${part.name}. Disponível: ${available}, solicitado: ${item.quantity}`,
        );
      }

      partItems.push(new PartItem(null, part.id, item.quantity, part.unitPrice));
    }

    const serviceOrder = ServiceOrder.create(vehicle.id, serviceItems, partItems);
    await this.serviceOrderRepository.save(serviceOrder);
    return serviceOrder;
  }
}
