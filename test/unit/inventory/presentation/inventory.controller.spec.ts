import { InventoryController } from '@inventory/presentation/inventory.controller';
import { type CreatePartUseCase } from '@inventory/application/use-cases/create-part.use-case';
import { type RestockPartUseCase } from '@inventory/application/use-cases/restock-part.use-case';
import { type ConsumePartUseCase } from '@inventory/application/use-cases/consume-part.use-case';
import { type ListPartsUseCase } from '@inventory/application/use-cases/list-parts.use-case';
import { type UpdatePartUseCase } from '@inventory/application/use-cases/update-part.use-case';
import { type SoftDeletePartUseCase } from '@inventory/application/use-cases/soft-delete-part.use-case';
import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';

const makePart = (overrides: Partial<Part> = {}): Part =>
  Object.assign(
    new Part(
      '123e4567-e89b-12d3-a456-426614174000',
      'Óleo de motor 5W30',
      new UnitOfMeasure('ML'),
      45.9,
      new Quantity(20),
    ),
    overrides,
  );

describe('InventoryController', () => {
  let controller: InventoryController;
  let createPart: jest.Mocked<CreatePartUseCase>;
  let restockPart: jest.Mocked<RestockPartUseCase>;
  let consumePart: jest.Mocked<ConsumePartUseCase>;
  let listParts: jest.Mocked<ListPartsUseCase>;
  let updatePart: jest.Mocked<UpdatePartUseCase>;
  let softDeletePart: jest.Mocked<SoftDeletePartUseCase>;

  beforeEach(() => {
    createPart = { execute: jest.fn() } as unknown as jest.Mocked<CreatePartUseCase>;
    restockPart = { execute: jest.fn() } as unknown as jest.Mocked<RestockPartUseCase>;
    consumePart = { execute: jest.fn() } as unknown as jest.Mocked<ConsumePartUseCase>;
    listParts = { execute: jest.fn() } as unknown as jest.Mocked<ListPartsUseCase>;
    updatePart = { execute: jest.fn() } as unknown as jest.Mocked<UpdatePartUseCase>;
    softDeletePart = { execute: jest.fn() } as unknown as jest.Mocked<SoftDeletePartUseCase>;

    controller = new InventoryController(
      createPart,
      restockPart,
      consumePart,
      listParts,
      updatePart,
      softDeletePart,
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
    ).resolves.toBe(part);
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

    await expect(controller.findAll()).resolves.toBe(parts);
  });

  it('atualiza nome e preço', async () => {
    const part = makePart({ name: 'Filtro de óleo premium', unitPrice: 25 });
    updatePart.execute.mockResolvedValue(part);

    await expect(
      controller.update('part-id', { name: 'Filtro de óleo premium', unitPrice: 25 }),
    ).resolves.toBe(part);
    expect(updatePart.execute).toHaveBeenCalledWith('part-id', {
      name: 'Filtro de óleo premium',
      unitPrice: 25,
    });
  });

  it('dá baixa no estoque', async () => {
    const part = makePart({ quantity: new Quantity(16) });
    consumePart.execute.mockResolvedValue(part);

    await expect(controller.consume('part-id', { quantity: 4 })).resolves.toBe(part);
    expect(consumePart.execute).toHaveBeenCalledWith('part-id', 4);
  });

  it('faz soft delete', async () => {
    softDeletePart.execute.mockResolvedValue(undefined);

    await expect(controller.remove('part-id')).resolves.toBeUndefined();
    expect(softDeletePart.execute).toHaveBeenCalledWith('part-id');
  });
});
