import { CreatePartUseCase } from '@inventory/application/use-cases/create-part.use-case';
import { type PartRepository } from '@inventory/domain/repositories/part.repository';
import { type CreatePartDto } from '@inventory/presentation/dtos/create-part.dto';

describe('CreatePartUseCase', () => {
  let repository: jest.Mocked<PartRepository>;
  let useCase: CreatePartUseCase;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      findAll: jest.fn(),
      findReservedQuantities: jest.fn(),
      findByIdList: jest.fn(),
      findBelowMinimum: jest.fn(),
      softDelete: jest.fn(),
    };
    useCase = new CreatePartUseCase(repository);
  });

  it('deve criar e salvar uma peça', async () => {
    const dto: CreatePartDto = {
      name: 'Óleo de motor',
      unitOfMeasure: 'ML',
      unitPrice: 45.9,
      quantity: 20,
    };

    const part = await useCase.execute(dto);

    expect(part.name).toBe('Óleo de motor');
    expect(part.quantity.value).toBe(20);
    expect(repository.save).toHaveBeenCalledWith(part);
  });

  it('deve definir a quantidade como 0 quando não fornecida', async () => {
    const dto: CreatePartDto = {
      name: 'Filtro de óleo',
      unitOfMeasure: 'UNIT',
      unitPrice: 30,
    };

    const part = await useCase.execute(dto);

    expect(part.quantity.value).toBe(0);
  });
});
