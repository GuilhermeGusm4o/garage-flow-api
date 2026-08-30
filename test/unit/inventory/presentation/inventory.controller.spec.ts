import { InventoryController } from '@inventory/presentation/inventory.controller';
import { type CreatePartUseCase } from '@inventory/application/use-cases/create-part.use-case';
import { type RestockPartUseCase } from '@inventory/application/use-cases/restock-part.use-case';
import { type ConsumePartUseCase } from '@inventory/application/use-cases/consume-part.use-case';
import { type ListPartsUseCase } from '@inventory/application/use-cases/list-parts.use-case';
import { type ListLowStockPartsUseCase } from '@inventory/application/use-cases/list-low-stock-parts.use-case';
import { type UpdatePartUseCase } from '@inventory/application/use-cases/update-part.use-case';
import { type DeletePartUseCase } from '@inventory/application/use-cases/delete-part.use-case';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';
import { StockLevel } from '@inventory/domain/value-objects/stock-level.vo';
import { PartResponseDto } from '@inventory/presentation/dtos/part-response.dto';
import { makePart } from '../part.factory';

describe('InventoryController', () => {
  let controller: InventoryController;
  let createPart: jest.Mocked<CreatePartUseCase>;
  let restockPart: jest.Mocked<RestockPartUseCase>;
  let consumePart: jest.Mocked<ConsumePartUseCase>;
  let listParts: jest.Mocked<ListPartsUseCase>;
  let listLowStockParts: jest.Mocked<ListLowStockPartsUseCase>;
  let updatePart: jest.Mocked<UpdatePartUseCase>;
  let deletePart: jest.Mocked<DeletePartUseCase>;

  beforeEach(() => {
    createPart = { execute: jest.fn() } as unknown as jest.Mocked<CreatePartUseCase>;
    restockPart = { execute: jest.fn() } as unknown as jest.Mocked<RestockPartUseCase>;
    consumePart = { execute: jest.fn() } as unknown as jest.Mocked<ConsumePartUseCase>;
    listParts = { execute: jest.fn() } as unknown as jest.Mocked<ListPartsUseCase>;
    listLowStockParts = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ListLowStockPartsUseCase>;
    updatePart = { execute: jest.fn() } as unknown as jest.Mocked<UpdatePartUseCase>;
    deletePart = { execute: jest.fn() } as unknown as jest.Mocked<DeletePartUseCase>;

    controller = new InventoryController(
      createPart,
      restockPart,
      consumePart,
      listParts,
      listLowStockParts,
      updatePart,
      deletePart,
    );
  });

  it('cria uma peça', async () => {
    const part = makePart();
    createPart.execute.mockResolvedValue(part);

    await expect(
      controller.create({
        name: 'Óleo de motor 5W30',
        unitOfMeasure: 'ML',
        unitPrice: 45.9,
        quantity: 20,
      }),
    ).resolves.toEqual(PartResponseDto.fromEntity(part));
    expect(createPart.execute).toHaveBeenCalledWith({
      name: 'Óleo de motor 5W30',
      unitOfMeasure: 'ML',
      unitPrice: 45.9,
      quantity: 20,
    });
  });

  it('lista as peças', async () => {
    const parts = [makePart()];
    listParts.execute.mockResolvedValue(parts);

    await expect(controller.findAll()).resolves.toEqual(parts.map(PartResponseDto.fromEntity));
  });

  it('lista o estoque abaixo do mínimo já mapeado para o DTO de resposta', async () => {
    const part = makePart({
      id: 'part-1',
      quantity: new Quantity(20),
      minQuantity: new Quantity(15),
    });
    listLowStockParts.execute.mockResolvedValue([new StockLevel(part, 8)]);

    const result = await controller.findLowStock();

    expect(result).toEqual([
      {
        id: 'part-1',
        name: 'Óleo de motor 5W30',
        unitOfMeasure: 'ML',
        physicalQuantity: 20,
        reservedQuantity: 8,
        availableQuantity: 12,
        minQuantity: 15,
      },
    ]);
  });

  it('devolve lista vazia quando nada está abaixo do mínimo', async () => {
    listLowStockParts.execute.mockResolvedValue([]);

    await expect(controller.findLowStock()).resolves.toEqual([]);
  });

  it('atualiza nome e preço', async () => {
    const part = makePart({ name: 'Filtro de óleo premium', unitPrice: 25 });
    updatePart.execute.mockResolvedValue(part);

    await expect(
      controller.update('part-id', { name: 'Filtro de óleo premium', unitPrice: 25 }),
    ).resolves.toEqual(PartResponseDto.fromEntity(part));
    expect(updatePart.execute).toHaveBeenCalledWith('part-id', {
      name: 'Filtro de óleo premium',
      unitPrice: 25,
    });
  });

  it('dá baixa no estoque', async () => {
    const part = makePart({ quantity: new Quantity(16) });
    consumePart.execute.mockResolvedValue(part);

    await expect(controller.consume('part-id', { quantity: 4 })).resolves.toEqual(
      PartResponseDto.fromEntity(part),
    );
    expect(consumePart.execute).toHaveBeenCalledWith('part-id', 4);
  });

  it('faz soft delete', async () => {
    deletePart.execute.mockResolvedValue(undefined);

    await expect(controller.remove('part-id')).resolves.toBeUndefined();
    expect(deletePart.execute).toHaveBeenCalledWith('part-id');
  });
});
