import { NotFoundException } from '@nestjs/common';
import { FindServiceOrderByIdUseCase } from '@service-orders/application/use-cases/find-service-order-by-id.use-case';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { makeServiceOrder, makeServiceOrderRepositoryMock } from '../service-order.factory';

describe('FindServiceOrderByIdUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepository>;
  let useCase: FindServiceOrderByIdUseCase;

  beforeEach(() => {
    repository = makeServiceOrderRepositoryMock();
    useCase = new FindServiceOrderByIdUseCase(repository);
  });

  it('devolve a OS encontrada', async () => {
    const serviceOrder = makeServiceOrder();
    repository.findById.mockResolvedValue(serviceOrder);

    await expect(useCase.execute(serviceOrder.id)).resolves.toBe(serviceOrder);
    expect(repository.findById).toHaveBeenCalledWith(serviceOrder.id);
  });

  it('lança 404 quando a OS não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('inexistente')).rejects.toThrow(NotFoundException);
  });
});
