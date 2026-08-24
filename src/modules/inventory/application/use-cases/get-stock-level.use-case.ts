import { Injectable, NotFoundException } from '@nestjs/common';
import { PartRepository } from '@inventory/domain/repositories/part.repository';
import { StockLevel } from '@inventory/domain/value-objects/stock-level.vo';
import { STOCK_RESERVING_STATUSES } from '@inventory/application/stock-reserving-statuses';

/**
 * Posição de estoque (físico, reservado e lógico) de uma peça específica.
 * Ponto único de cálculo do estoque lógico para consultas pontuais.
 */
@Injectable()
export class GetStockLevelUseCase {
  constructor(private readonly partRepository: PartRepository) {}

  async execute(partId: string): Promise<StockLevel> {
    const part = await this.partRepository.findById(partId);
    if (!part) throw new NotFoundException('Peça não encontrada');

    const reservedQuantity = await this.partRepository.findReservedQuantityForPart(
      partId,
      STOCK_RESERVING_STATUSES,
    );

    return new StockLevel(part, reservedQuantity);
  }
}
