import { NotFoundException } from '@nestjs/common';
import { SoftDeletePartUseCase } from '@inventory/application/use-cases/soft-delete-part.use-case';
import { type PartRepository } from '@inventory/domain/repositories/part.repository';
import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';

describe('SoftDeletePartUseCase', () => {
  let repository: jest.Mocked<PartRepository>;
  let useCase: SoftDeletePartUseCase;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      findAll: jest.fn(),
      findReservedQuantities: jest.fn(),
      softDelete: jest.fn(),
    };
    useCase = new SoftDeletePartUseCase(repository);
  });

  it('deve chamar softDelete quando a peça existe', async () => {
    const part = new Part('part-1', 'Óleo', new UnitOfMeasure('ML'), 45.9, new Quantity(10));
    repository.findById.mockResolvedValue(part);

    await useCase.execute('part-1');

    expect(repository.softDelete).toHaveBeenCalledWith('part-1');
  });

  it('deve lançar NotFoundException quando a peça não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('unknown')).rejects.toThrow(NotFoundException);
  });
});
