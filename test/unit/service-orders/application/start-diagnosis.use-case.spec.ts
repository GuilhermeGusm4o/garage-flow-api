import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StartDiagnosisUseCase } from '@service-orders/application/use-cases/start-diagnosis.use-case';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

describe('StartDiagnosisUseCase', () => {
  const repository = {
    findById: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<ServiceOrderRepository>;
  const useCase = new StartDiagnosisUseCase(repository);

  const makeOrder = (status: ServiceOrderStatus) =>
    new ServiceOrder('order-1', 'vehicle-1', 'Falha no motor', null, status, null, 0, [], []);

  beforeEach(() => jest.clearAllMocks());

  it('inicia o diagnostico somente para OS recebida', async () => {
    const order = makeOrder(ServiceOrderStatus.RECEIVED);
    repository.findById.mockResolvedValue(order);
    repository.save.mockResolvedValue(order);

    await useCase.execute(order.id, 'mechanic-1');

    expect(order.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    expect(order.mechanicId).toBe('mechanic-1');
    expect(repository.save).toHaveBeenCalledWith(order);
  });

  it('recusa OS que ja estao em outro status', async () => {
    const order = makeOrder(ServiceOrderStatus.AWAITING_APPROVAL);
    repository.findById.mockResolvedValue(order);

    await expect(useCase.execute(order.id, 'mechanic-1')).rejects.toThrow(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('retorna erro quando a OS nao existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-order', 'mechanic-1')).rejects.toThrow(NotFoundException);
  });
});
