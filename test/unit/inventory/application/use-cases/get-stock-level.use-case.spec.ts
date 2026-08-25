import { NotFoundException } from '@nestjs/common';
import { GetStockLevelUseCase } from '@inventory/application/use-cases/get-stock-level.use-case';
import { OPEN_SERVICE_ORDER_STATUSES } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type PartRepository } from '@inventory/domain/repositories/part.repository';
import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';

const buildPart = (quantity: number, minQuantity = 0) =>
  new Part(
    'part-1',
    'Óleo de motor',
    new UnitOfMeasure('ML'),
    45.9,
    new Quantity(quantity),
    new Quantity(minQuantity),
  );

describe('GetStockLevelUseCase', () => {
  let repository: jest.Mocked<PartRepository>;
  let useCase: GetStockLevelUseCase;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      softDelete: jest.fn(),
      findReservedQuantities: jest.fn(),
      findReservedQuantityForPart: jest.fn(),
    };
    repository.findReservedQuantityForPart.mockResolvedValue(0);
    useCase = new GetStockLevelUseCase(repository);
  });

  it('devolve a posição de estoque da peça', async () => {
    repository.findById.mockResolvedValue(buildPart(20, 15));
    repository.findReservedQuantityForPart.mockResolvedValue(8);

    const level = await useCase.execute('part-1');

    expect(level.part.quantity.value).toBe(20);
    expect(level.reservedQuantity).toBe(8);
    expect(level.availableQuantity).toBe(12);
    expect(level.isBelowMinimum()).toBe(true);
  });

  it('consulta a reserva da peça apenas nas OS em aberto', async () => {
    repository.findById.mockResolvedValue(buildPart(20));

    await useCase.execute('part-1');

    expect(repository.findReservedQuantityForPart).toHaveBeenCalledWith(
      'part-1',
      OPEN_SERVICE_ORDER_STATUSES,
    );
  });

  it('lança 404 quando a peça não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('inexistente')).rejects.toThrow(NotFoundException);
    expect(repository.findReservedQuantityForPart).not.toHaveBeenCalled();
  });

  it('mantém o estoque físico quando não há reserva', async () => {
    repository.findById.mockResolvedValue(buildPart(20));

    const level = await useCase.execute('part-1');

    expect(level.availableQuantity).toBe(20);
  });
});
