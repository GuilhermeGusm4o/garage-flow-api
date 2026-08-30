import { NotFoundException } from '@nestjs/common';
import { FindPartByIdUseCase } from '@inventory/application/use-cases/find-part-by-id.use-case';
import { type PartRepository } from '@inventory/domain/repositories/part.repository';
import { makePart } from '../../part.factory';

describe('FindPartByIdUseCase', () => {
  let repository: jest.Mocked<PartRepository>;
  let useCase: FindPartByIdUseCase;

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
    useCase = new FindPartByIdUseCase(repository);
  });

  it('devolve a peça encontrada', async () => {
    const part = makePart();
    repository.findById.mockResolvedValue(part);

    await expect(useCase.execute(part.id)).resolves.toBe(part);
    expect(repository.findById).toHaveBeenCalledWith(part.id);
  });

  it('lança 404 quando a peça não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('inexistente')).rejects.toThrow(NotFoundException);
  });
});
