import { NotFoundException } from '@nestjs/common';
import { CalculateAvailabilityUseCase } from '@inventory/application/use-cases/calculate-availability.use-case';
import { type PartRepository } from '@inventory/domain/repositories/part.repository';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';
import { makePart } from '../../part.factory';

describe('CalculateAvailabilityUseCase', () => {
  let repository: jest.Mocked<PartRepository>;
  let useCase: CalculateAvailabilityUseCase;

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
    useCase = new CalculateAvailabilityUseCase(repository);
  });

  it('devolve a quantidade em estoque da peça', async () => {
    const part = makePart({ quantity: new Quantity(15) });
    repository.findById.mockResolvedValue(part);

    await expect(useCase.execute(part.id)).resolves.toBe(15);
    expect(repository.findById).toHaveBeenCalledWith(part.id);
  });

  it('lança 404 quando a peça não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('inexistente')).rejects.toThrow(NotFoundException);
  });
});
