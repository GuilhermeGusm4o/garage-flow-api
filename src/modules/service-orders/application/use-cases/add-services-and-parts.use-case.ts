import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { AddServicesAndPartsDto } from '@service-orders/presentation/dtos/add-services-and-parts.dto';
import { CheckPartsAvailabilityUseCase } from '@inventory/application/use-cases/check-parts-availability.use-case';
import { type StockLevel } from '@inventory/domain/value-objects/stock-level.vo';
import { FindServicesByIdListUseCase } from '@service/application/use-cases/find-services-by-id-list.use-case';
import { CalculateTotalAmountUseCase } from '@service-orders/application/use-cases/calculate-total-amount.use-case';

/**
 * Além da OS atualizada, devolve as peças recém-adicionadas cujo estoque lógico
 * ficou abaixo do mínimo — o alerta que aparece no orçamento.
 */
export interface AddServicesAndPartsResult {
  serviceOrder: ServiceOrder;
  stockAlerts: StockLevel[];
}

@Injectable()
export class AddServicesAndPartsUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepository,
    private readonly checkPartsAvailability: CheckPartsAvailabilityUseCase,
    private readonly findServicesByIdList: FindServicesByIdListUseCase,
    private readonly calculateTotalAmount: CalculateTotalAmountUseCase,
  ) {}

  async execute(
    id: string,
    dto: AddServicesAndPartsDto,
    mechanicId: string,
  ): Promise<AddServicesAndPartsResult> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);
    if (!serviceOrder) throw new NotFoundException('Service order not found');

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

    serviceOrder.finishDiagnosis(mechanicId);
    serviceOrder.addServicesAndParts(newServiceItems, newPartItems, totalAmount);

    const savedServiceOrder = await this.serviceOrderRepository.save(serviceOrder);

    return {
      serviceOrder: savedServiceOrder,
      stockAlerts: await this.collectStockAlerts(newPartItems),
    };
  }

  /**
   * Calculado depois de salvar: a OS já está em AWAITING_APPROVAL, que reserva
   * estoque, então o nível lógico aqui já considera as peças recém-adicionadas.
   */
  private async collectStockAlerts(partItems: PartItem[]): Promise<StockLevel[]> {
    const availabilities = await this.checkPartsAvailability.execute(
      partItems.map((item) => ({ inventoryId: item.inventoryId, quantity: item.quantity })),
    );

    return availabilities
      .map((availability) => availability.stockLevel)
      .filter((stockLevel) => stockLevel.isBelowMinimum());
  }
}
