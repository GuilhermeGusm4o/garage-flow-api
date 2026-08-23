import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { FinishServiceUseCase } from '@service-orders/application/use-cases/finish-service.use-case';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

describe('FinishServiceUseCase', () => {
  const repository = {
    findById: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<ServiceOrderRepository>;
  const useCase = new FinishServiceUseCase(repository);

  const makeOrder = (status: ServiceOrderStatus, mechanicId: string | null) =>
    new ServiceOrder('order-1', 'vehicle-1', 'Falha no motor', mechanicId, status, null, 0, [], []);

  beforeEach(() => jest.clearAllMocks());

  it('finishes an order in execution for the assigned mechanic', async () => {
    const order = makeOrder(ServiceOrderStatus.IN_EXECUTION, 'mechanic-1');
    repository.findById.mockResolvedValue(order);
    repository.save.mockResolvedValue(order);

    await useCase.execute(order.id, 'mechanic-1');

    expect(order.status).toBe(ServiceOrderStatus.FINISHED);
    expect(order.serviceFinishedAt).toBeInstanceOf(Date);
    expect(repository.save).toHaveBeenCalledWith(order);
  });

  it('rejects a mechanic who is not assigned to the order', async () => {
    const order = makeOrder(ServiceOrderStatus.IN_EXECUTION, 'mechanic-1');
    repository.findById.mockResolvedValue(order);

    await expect(useCase.execute(order.id, 'mechanic-2')).rejects.toThrow(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('rejects an order that is not in execution', async () => {
    const order = makeOrder(ServiceOrderStatus.IN_DIAGNOSIS, 'mechanic-1');
    repository.findById.mockResolvedValue(order);

    await expect(useCase.execute(order.id, 'mechanic-1')).rejects.toThrow(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('returns not found when the order does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-order', 'mechanic-1')).rejects.toThrow(NotFoundException);
  });
});
