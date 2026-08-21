import { NotFoundException } from '@nestjs/common';
import { UpdatePartUseCase } from '@inventory/application/use-cases/update-part.use-case';
import { type PartRepository } from '@inventory/domain/repositories/part.repository';
import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';

describe('UpdatePartUseCase', () => {
  let repository: jest.Mocked<PartRepository>;
  let useCase: UpdatePartUseCase;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findBelowMinimum: jest.fn(),
      softDelete: jest.fn(),
    };
    useCase = new UpdatePartUseCase(repository);
  });

  it('deve atualizar nome e preço de uma peça existente', async () => {
    const part = new Part('part-1', 'Óleo', new UnitOfMeasure('ML'), 45.9, new Quantity(10));
    repository.findById.mockResolvedValue(part);

    const result = await useCase.execute('part-1', { name: 'Óleo sintético', unitPrice: 59.9 });

    expect(result.name).toBe('Óleo sintético');
    expect(result.unitPrice).toBe(59.9);
    expect(repository.save).toHaveBeenCalledWith(part);
  });

  it('deve lançar NotFoundException quando a peça não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('unknown', { name: 'X', unitPrice: 10 })).rejects.toThrow(
      NotFoundException,
    );
  });
});
