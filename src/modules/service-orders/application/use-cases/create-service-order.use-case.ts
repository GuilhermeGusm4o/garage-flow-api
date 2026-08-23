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
import { CalculateTotalAmountUseCase } from '@service-orders/application/use-cases/calculate-total-amount.use-case';

@Injectable()
export class CreateServiceOrderUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepository,
    private readonly findClientByCpfCnpj: FindClientByCpfCnpjUseCase,
    private readonly findVehicleByLicensePlate: FindVehicleByLicensePlateUseCase,
    private readonly findPartById: FindPartByIdUseCase,
    private readonly calculateAvailability: CalculateAvailabilityUseCase,
    private readonly findServicesByIdList: FindServicesByIdListUseCase,
    private readonly calculateTotalAmount: CalculateTotalAmountUseCase,
  ) {}

  async execute(dto: CreateServiceOrderDto): Promise<ServiceOrder> {
    const client = await this.findClientByCpfCnpj.execute(dto.clientCpfCnpj);

    const vehicle = await this.findVehicleByLicensePlate.execute(dto.licensePlate);
    if (vehicle.clientId !== client.id) {
      throw new BadRequestException('Veículo não pertence ao cliente informado');
    }

    const serviceItemsPromise =
      dto.services.length > 0
        ? this.findServicesByIdList
            .execute(dto.services.map((item) => item.serviceId))
            .then((services) =>
              services.map((service) => new ServiceItem(null, service.id, service.price.getValue())),
            )
        : Promise.resolve([]);

    const partItemsPromise = Promise.all(
      dto.parts.map(async (item) => {
        const [part, availableQuantity] = await Promise.all([
          this.findPartById.execute(item.inventoryId),
          this.calculateAvailability.execute(item.inventoryId),
        ]);

        if (item.quantity > availableQuantity) {
          throw new BadRequestException(
            `Quantidade indisponível para a peça ${part.name}. Disponível: ${availableQuantity}, solicitado: ${item.quantity}`,
          );
        }

        return new PartItem(null, part.id, item.quantity, part.unitPrice);
      }),
    );

    const [serviceItems, partItems] = await Promise.all([serviceItemsPromise, partItemsPromise]);

    const totalAmount = await this.calculateTotalAmount.execute(serviceItems, partItems);
    const serviceOrder = ServiceOrder.create(vehicle.id, serviceItems, partItems, totalAmount);
    const savedServiceOrder = await this.serviceOrderRepository.save(serviceOrder);
    return savedServiceOrder;
  }
}
