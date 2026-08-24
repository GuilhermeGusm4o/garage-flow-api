import { ListLowStockPartsUseCase } from '@inventory/application/use-cases/list-low-stock-parts.use-case';
import { type ListStockLevelsUseCase } from '@inventory/application/use-cases/list-stock-levels.use-case';
import { StockLevel } from '@inventory/domain/value-objects/stock-level.vo';
import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';

const buildLevel = (id: string, quantity: number, minQuantity: number, reserved = 0) =>
  new StockLevel(
    new Part(
      id,
      `Peça ${id}`,
      new UnitOfMeasure('UNIT'),
      10,
      new Quantity(quantity),
      new Quantity(minQuantity),
    ),
    reserved,
  );

describe('ListLowStockPartsUseCase', () => {
  let listStockLevels: jest.Mocked<ListStockLevelsUseCase>;
  let useCase: ListLowStockPartsUseCase;

  beforeEach(() => {
    listStockLevels = { execute: jest.fn() } as unknown as jest.Mocked<ListStockLevelsUseCase>;
    useCase = new ListLowStockPartsUseCase(listStockLevels);
  });

  it('mantém apenas as peças abaixo do mínimo', async () => {
    listStockLevels.execute.mockResolvedValue([buildLevel('ok', 20, 5), buildLevel('baixa', 3, 5)]);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].part.id).toBe('baixa');
  });

  it('usa o estoque lógico, não o físico, para decidir', async () => {
    listStockLevels.execute.mockResolvedValue([buildLevel('p1', 20, 15, 8)]);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].part.isBelowMinimum()).toBe(false);
    expect(result[0].availableQuantity).toBe(12);
  });

  it('não acusa peça cujo mínimo é menor que o estoque lógico', async () => {
    listStockLevels.execute.mockResolvedValue([buildLevel('p1', 2, 1)]);

    await expect(useCase.execute()).resolves.toEqual([]);
  });

  it('devolve lista vazia quando não há peças', async () => {
    listStockLevels.execute.mockResolvedValue([]);

    await expect(useCase.execute()).resolves.toEqual([]);
  });
});
