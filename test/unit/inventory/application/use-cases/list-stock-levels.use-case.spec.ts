import { ListStockLevelsUseCase } from '@inventory/application/use-cases/list-stock-levels.use-case';
import { type PartRepository } from '@inventory/domain/repositories/part.repository';
import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';
import {
  OPEN_SERVICE_ORDER_STATUSES,
  ServiceOrderStatus,
} from '@service-orders/domain/value-objects/service-order-status.vo';

const buildPart = (id: string, quantity: number, minQuantity = 0) =>
  new Part(
    id,
    `Peça ${id}`,
    new UnitOfMeasure('UNIT'),
    10,
    new Quantity(quantity),
    new Quantity(minQuantity),
  );

describe('ListStockLevelsUseCase', () => {
  let repository: jest.Mocked<PartRepository>;
  let useCase: ListStockLevelsUseCase;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      softDelete: jest.fn(),
      findReservedQuantities: jest.fn(),
      findReservedQuantityForPart: jest.fn(),
    };
    repository.findReservedQuantities.mockResolvedValue(new Map());
    useCase = new ListStockLevelsUseCase(repository);
  });

  it('devolve todas as peças, e não só as abaixo do mínimo', async () => {
    repository.findAll.mockResolvedValue([buildPart('a', 100, 5), buildPart('b', 1, 5)]);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result.map((level) => level.part.id)).toEqual(['a', 'b']);
  });

  it('desconta a reserva de cada peça', async () => {
    repository.findAll.mockResolvedValue([buildPart('a', 20), buildPart('b', 30)]);
    repository.findReservedQuantities.mockResolvedValue(
      new Map([
        ['a', 8],
        ['b', 5],
      ]),
    );

    const result = await useCase.execute();

    expect(result[0].availableQuantity).toBe(12);
    expect(result[1].availableQuantity).toBe(25);
  });

  it('trata peça sem reserva como reserva zero', async () => {
    repository.findAll.mockResolvedValue([buildPart('a', 20)]);
    repository.findReservedQuantities.mockResolvedValue(new Map([['outra', 99]]));

    const result = await useCase.execute();

    expect(result[0].reservedQuantity).toBe(0);
    expect(result[0].availableQuantity).toBe(20);
  });

  it('consulta a reserva apenas das OS em aberto', async () => {
    repository.findAll.mockResolvedValue([]);

    await useCase.execute();

    expect(repository.findReservedQuantities).toHaveBeenCalledWith(OPEN_SERVICE_ORDER_STATUSES);
    expect(OPEN_SERVICE_ORDER_STATUSES).toEqual([
      ServiceOrderStatus.RECEIVED,
      ServiceOrderStatus.IN_DIAGNOSIS,
      ServiceOrderStatus.AWAITING_APPROVAL,
      ServiceOrderStatus.IN_EXECUTION,
    ]);
  });

  it('não considera OS finalizada, entregue ou cancelada como reserva', () => {
    expect(OPEN_SERVICE_ORDER_STATUSES).not.toContain(ServiceOrderStatus.FINISHED);
    expect(OPEN_SERVICE_ORDER_STATUSES).not.toContain(ServiceOrderStatus.DELIVERED);
    expect(OPEN_SERVICE_ORDER_STATUSES).not.toContain(ServiceOrderStatus.CANCELED);
  });

  it('devolve lista vazia quando não há peças', async () => {
    repository.findAll.mockResolvedValue([]);

    await expect(useCase.execute()).resolves.toEqual([]);
  });
});
