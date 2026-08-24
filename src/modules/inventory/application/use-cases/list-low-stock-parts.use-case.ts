import { Injectable } from '@nestjs/common';
import { StockLevel } from '@inventory/domain/value-objects/stock-level.vo';
import { ListStockLevelsUseCase } from '@inventory/application/use-cases/list-stock-levels.use-case';

/** Peças cujo estoque lógico já caiu abaixo do mínimo recomendado. */
@Injectable()
export class ListLowStockPartsUseCase {
  constructor(private readonly listStockLevels: ListStockLevelsUseCase) {}

  async execute(): Promise<StockLevel[]> {
    const levels = await this.listStockLevels.execute();
    return levels.filter((level) => level.isBelowMinimum());
  }
}
