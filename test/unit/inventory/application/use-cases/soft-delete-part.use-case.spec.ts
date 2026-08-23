import { NotFoundException } from '@nestjs/common';
import { SoftDeletePartUseCase } from '@inventory/application/use-cases/soft-delete-part.use-case';
import { type PartRepository } from '@inventory/domain/repositories/part.repository';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';
import { makePart } from '../../part.factory';

describe('SoftDeletePartUseCase', () => {
  let repository: jest.Mocked<PartRepository>;
  let useCase: SoftDeletePartUseCase;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findBelowMinimum: jest.fn(),
      softDelete: jest.fn(),
    };
    useCase = new SoftDeletePartUseCase(repository);
  });

  it('deve chamar softDelete quando a peça existe', async () => {
    const part = makePart({ id: 'part-1', name: 'Óleo', quantity: new Quantity(10) });
    repository.findById.mockResolvedValue(part);

    await useCase.execute('part-1');

    expect(repository.softDelete).toHaveBeenCalledWith('part-1');
  });

  it('deve lançar NotFoundException quando a peça não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('unknown')).rejects.toThrow(NotFoundException);
  });
});
