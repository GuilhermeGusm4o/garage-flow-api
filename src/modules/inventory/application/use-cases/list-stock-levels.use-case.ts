import { Injectable } from '@nestjs/common';
import { PartRepository } from '@inventory/domain/repositories/part.repository';
import { StockLevel } from '@inventory/domain/value-objects/stock-level.vo';
import { OPEN_SERVICE_ORDER_STATUSES } from '@service-orders/domain/value-objects/service-order-status.vo';

/**
 * Posição de estoque (físico, reservado e lógico) de todas as peças ativas.
 * Ponto único de cálculo do estoque lógico para listagens.
 */
@Injectable()
export class ListStockLevelsUseCase {
  constructor(private readonly partRepository: PartRepository) {}

  async execute(): Promise<StockLevel[]> {
    const [parts, reservedByPart] = await Promise.all([
      this.partRepository.findAll(),
      this.partRepository.findReservedQuantities(OPEN_SERVICE_ORDER_STATUSES),
    ]);

    return parts.map((part) => new StockLevel(part, reservedByPart.get(part.id) ?? 0));
  }
}
