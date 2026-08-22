import { NotFoundException } from '@nestjs/common';
import { RestockPartUseCase } from '@inventory/application/use-cases/restock-part.use-case';
import { type PartRepository } from '@inventory/domain/repositories/part.repository';
import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';

describe('RestockPartUseCase', () => {
  let repository: jest.Mocked<PartRepository>;
  let useCase: RestockPartUseCase;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findBelowMinimum: jest.fn(),
      softDelete: jest.fn(),
    };
    useCase = new RestockPartUseCase(repository);
  });

  it('deve repor o estoque de uma peça existente', async () => {
    const part = new Part('part-1', 'Óleo', new UnitOfMeasure('ML'), 45.9, new Quantity(10));
    repository.findById.mockResolvedValue(part);

    const result = await useCase.execute('part-1', 5);

    expect(result.quantity.value).toBe(15);
    expect(repository.save).toHaveBeenCalledWith(part);
  });

  it('deve lançar um erro quando a peça não existir', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('unknown', 5)).rejects.toThrow(NotFoundException);
  });
});
