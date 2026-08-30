import { NotFoundException } from '@nestjs/common';
import { DeleteServiceOrderUseCase } from '@service-orders/application/use-cases/delete-service-order.use-case';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { makeServiceOrder, makeServiceOrderRepositoryMock } from '../service-order.factory';

describe('DeleteServiceOrderUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepository>;
  let useCase: DeleteServiceOrderUseCase;

  beforeEach(() => {
    repository = makeServiceOrderRepositoryMock();
    useCase = new DeleteServiceOrderUseCase(repository);
  });

  it('soft-deleta a OS encontrada', async () => {
    const serviceOrder = makeServiceOrder();
    repository.findById.mockResolvedValue(serviceOrder);

    await useCase.execute(serviceOrder.id);

    expect(serviceOrder.deletedAt).not.toBeNull();
    expect(repository.save).toHaveBeenCalledWith(serviceOrder);
  });

  it('lança 404 quando a OS não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('inexistente')).rejects.toThrow(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
