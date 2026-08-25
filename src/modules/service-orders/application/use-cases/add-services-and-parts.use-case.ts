import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { AddServicesAndPartsDto } from '@service-orders/presentation/dtos/add-services-and-parts.dto';
import { CheckPartsAvailabilityUseCase } from '@inventory/application/use-cases/check-parts-availability.use-case';
import { FindServicesByIdListUseCase } from '@service/application/use-cases/find-services-by-id-list.use-case';
import { CalculateTotalAmountUseCase } from '@service-orders/application/use-cases/calculate-total-amount.use-case';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

@Injectable()
export class AddServicesAndPartsUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepository,
    private readonly checkPartsAvailability: CheckPartsAvailabilityUseCase,
    private readonly findServicesByIdList: FindServicesByIdListUseCase,
    private readonly calculateTotalAmount: CalculateTotalAmountUseCase,
  ) {}

  async execute(id: string, dto: AddServicesAndPartsDto): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);
    if (!serviceOrder) throw new NotFoundException('Service order not found');

    if (serviceOrder.status !== ServiceOrderStatus.IN_DIAGNOSIS) {
      throw new BadRequestException(
        'Cannot add services and parts to a service order that is not in IN_DIAGNOSIS status',
      );
    }

    const serviceItemsPromise =
      dto.services.length > 0
        ? this.findServicesByIdList
            .execute(dto.services.map((item) => item.serviceId))
            .then((services) =>
              services.map(
                (service) => new ServiceItem(null, service.id, service.price.getValue()),
              ),
            )
        : Promise.resolve([]);

    // Estoque lógico em lote: já desconta o que outras OS em aberto reservaram,
    // para que a mesma peça não seja comprometida duas vezes.
    const partItemsPromise = this.checkPartsAvailability
      .execute(dto.parts)
      .then((availabilities) => {
        const unavailable = availabilities.find((availability) => !availability.isAvailable);
        if (unavailable) {
          const { part, availableQuantity } = unavailable.stockLevel;
          throw new BadRequestException(
            `Quantidade indisponível para a peça ${part.name}. Disponível: ${availableQuantity}, solicitado: ${unavailable.requestedQuantity}`,
          );
        }

        const partsById = new Map(
          availabilities.map((availability) => [
            availability.stockLevel.part.id,
            availability.stockLevel.part,
          ]),
        );

        return dto.parts.map((item) => {
          const part = partsById.get(item.inventoryId);
          if (!part) {
            throw new NotFoundException(`Peça ${item.inventoryId} não encontrada`);
          }
          return new PartItem(
            null,
            part.id,
            item.quantity,
            part.unitPrice,
            part.unitOfMeasure.value,
          );
        });
      });

    const [newServiceItems, newPartItems] = await Promise.all([
      serviceItemsPromise,
      partItemsPromise,
    ]);

    const totalAmount = await this.calculateTotalAmount.execute(
      [...serviceOrder.serviceItems, ...newServiceItems],
      [...serviceOrder.partItems, ...newPartItems],
    );

    serviceOrder.addServicesAndParts(newServiceItems, newPartItems, totalAmount);
    serviceOrder.updateStatus(ServiceOrderStatus.AWAITING_APPROVAL);

    return this.serviceOrderRepository.save(serviceOrder);
  }
}
