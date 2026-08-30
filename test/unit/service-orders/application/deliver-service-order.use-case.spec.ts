import { NotFoundException } from '@nestjs/common';
import { DeliverServiceOrderUseCase } from '@service-orders/application/use-cases/deliver-service-order.use-case';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { DomainError } from '@common/errors/domain.error';
import { makeServiceOrder, makeServiceOrderRepositoryMock } from '../service-order.factory';

describe('DeliverServiceOrderUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepository>;
  let useCase: DeliverServiceOrderUseCase;

  beforeEach(() => {
    repository = makeServiceOrderRepositoryMock();
    useCase = new DeliverServiceOrderUseCase(repository);
  });

  it('entrega uma OS finalizada', async () => {
    const serviceOrder = makeServiceOrder({ status: ServiceOrderStatus.FINISHED });
    repository.findById.mockResolvedValue(serviceOrder);
    repository.save.mockResolvedValue(serviceOrder);

    await expect(useCase.execute(serviceOrder.id)).resolves.toBe(serviceOrder);

    expect(serviceOrder.status).toBe(ServiceOrderStatus.DELIVERED);
    expect(repository.save).toHaveBeenCalledWith(serviceOrder);
  });

  it('recusa entregar uma OS que ainda não foi finalizada', async () => {
    const serviceOrder = makeServiceOrder({ status: ServiceOrderStatus.RECEIVED });
    repository.findById.mockResolvedValue(serviceOrder);

    await expect(useCase.execute(serviceOrder.id)).rejects.toThrow(DomainError);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('lança 404 quando a OS não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('inexistente')).rejects.toThrow(NotFoundException);
  });
});
