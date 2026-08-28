import { NotFoundException } from '@nestjs/common';
import { FindPartsByIdListUseCase } from '@inventory/application/use-cases/find-parts-by-id-list.use-case';
import { type PartRepository } from '@inventory/domain/repositories/part.repository';
import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';

describe('FindPartsByIdListUseCase', () => {
  let repository: jest.Mocked<PartRepository>;
  let useCase: FindPartsByIdListUseCase;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      findAll: jest.fn(),
      findByIdList: jest.fn(),
      findBelowMinimum: jest.fn(),
      softDelete: jest.fn(),
      findReservedQuantities: jest.fn(),
    };
    useCase = new FindPartsByIdListUseCase(repository);
  });

  it('deve retornar as peças pelo id list', async () => {
    const part1 = new Part(
      'id-1',
      'Óleo de motor',
      new UnitOfMeasure('ML'),
      45.9,
      new Quantity(20),
    );
    const part2 = new Part(
      'id-2',
      'Filtro de óleo',
      new UnitOfMeasure('UNIT'),
      30,
      new Quantity(10),
    );
    repository.findByIdList.mockResolvedValue([part1, part2]);

    const result = await useCase.execute(['id-1', 'id-2']);

    expect(repository.findByIdList).toHaveBeenCalledWith(['id-1', 'id-2']);
    expect(result).toEqual([part1, part2]);
  });

  it('deve lançar NotFoundException quando nenhuma peça for encontrada', async () => {
    repository.findByIdList.mockResolvedValue([]);

    await expect(useCase.execute(['id-1', 'id-2'])).rejects.toThrow(NotFoundException);
  });
});
