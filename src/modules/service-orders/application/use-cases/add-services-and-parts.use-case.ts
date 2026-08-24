import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { AddServicesAndPartsDto } from '@service-orders/presentation/dtos/add-services-and-parts.dto';
import { FindPartByIdUseCase } from '@inventory/application/use-cases/find-part-by-id.use-case';
import { CalculateAvailabilityUseCase } from '@inventory/application/use-cases/calculate-availability.use-case';
import { GetStockLevelUseCase } from '@inventory/application/use-cases/get-stock-level.use-case';
import { type StockLevel } from '@inventory/domain/value-objects/stock-level.vo';
import { FindServicesByIdListUseCase } from '@service/application/use-cases/find-services-by-id-list.use-case';
import { CalculateTotalAmountUseCase } from '@service-orders/application/use-cases/calculate-total-amount.use-case';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

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
    private readonly findPartById: FindPartByIdUseCase,
    private readonly calculateAvailability: CalculateAvailabilityUseCase,
    private readonly getStockLevel: GetStockLevelUseCase,
    private readonly findServicesByIdList: FindServicesByIdListUseCase,
    private readonly calculateTotalAmount: CalculateTotalAmountUseCase,
  ) {}

  async execute(id: string, dto: AddServicesAndPartsDto): Promise<AddServicesAndPartsResult> {
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

        return new PartItem(null, part.id, item.quantity, part.unitPrice, part.unitOfMeasure.value);
      }),
    );

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
    const inventoryIds = [...new Set(partItems.map((item) => item.inventoryId))];

    const levels = await Promise.all(
      inventoryIds.map((inventoryId) => this.getStockLevel.execute(inventoryId)),
    );

    return levels.filter((level) => level.isBelowMinimum());
  }
}
