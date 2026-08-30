import { ListLowStockPartsUseCase } from '@inventory/application/use-cases/list-low-stock-parts.use-case';
import { type PartRepository } from '@inventory/domain/repositories/part.repository';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';
import {
  OPEN_SERVICE_ORDER_STATUSES,
  ServiceOrderStatus,
} from '@service-orders/domain/value-objects/service-order-status.vo';
import { makePart } from '../../part.factory';

const buildPart = (id: string, quantity: number, minQuantity: number) =>
  makePart({
    id,
    name: `Peça ${id}`,
    unitPrice: 10,
    quantity: new Quantity(quantity),
    minQuantity: new Quantity(minQuantity),
  });

describe('ListLowStockPartsUseCase', () => {
  let repository: jest.Mocked<PartRepository>;
  let useCase: ListLowStockPartsUseCase;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      findAll: jest.fn(),
      findByIdList: jest.fn(),
      findBelowMinimum: jest.fn(),
      findReservedQuantities: jest.fn(),
    };
    repository.findReservedQuantities.mockResolvedValue(new Map());
    useCase = new ListLowStockPartsUseCase(repository);
  });

  it('mantém apenas as peças abaixo do mínimo', async () => {
    repository.findAll.mockResolvedValue([buildPart('ok', 20, 5), buildPart('baixa', 3, 5)]);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].part.id).toBe('baixa');
  });

  it('usa o estoque lógico, não o físico, para decidir', async () => {
    repository.findAll.mockResolvedValue([buildPart('p1', 20, 15)]);
    repository.findReservedQuantities.mockResolvedValue(new Map([['p1', 8]]));

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].part.isBelowMinimum()).toBe(false);
    expect(result[0].reservedQuantity).toBe(8);
    expect(result[0].availableQuantity).toBe(12);
  });

  it('não acusa peça cujo mínimo é menor que o estoque lógico', async () => {
    repository.findAll.mockResolvedValue([buildPart('p1', 2, 1)]);

    await expect(useCase.execute()).resolves.toEqual([]);
  });

  it('trata peça sem reserva como reserva zero', async () => {
    repository.findAll.mockResolvedValue([buildPart('p1', 4, 5)]);
    repository.findReservedQuantities.mockResolvedValue(new Map([['outra-peca', 99]]));

    const result = await useCase.execute();

    expect(result[0].reservedQuantity).toBe(0);
    expect(result[0].availableQuantity).toBe(4);
  });

  it('consulta a reserva apenas das OS em aberto', async () => {
    repository.findAll.mockResolvedValue([]);

    await useCase.execute();

    expect(repository.findReservedQuantities).toHaveBeenCalledWith(OPEN_SERVICE_ORDER_STATUSES);
    expect(OPEN_SERVICE_ORDER_STATUSES).toEqual([
      ServiceOrderStatus.RECEIVED,
      ServiceOrderStatus.IN_DIAGNOSIS,
      ServiceOrderStatus.FINISHED_DIAGNOSIS,
      ServiceOrderStatus.AWAITING_APPROVAL,
      ServiceOrderStatus.AWAITING_EXECUTION,
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
