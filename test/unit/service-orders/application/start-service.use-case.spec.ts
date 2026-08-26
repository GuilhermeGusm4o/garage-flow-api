import { NotFoundException } from '@nestjs/common';
import { StartServiceUseCase } from '@service-orders/application/use-cases/start-service.use-case';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { DomainError } from '@common/errors/domain.error';

describe('StartServiceUseCase', () => {
  const makeOrder = (mechanicId: string | null) =>
    new ServiceOrder(
      'order-1',
      'vehicle-1',
      'Falha no motor',
      mechanicId,
      ServiceOrderStatus.AWAITING_EXECUTION,
      new Date(),
      100,
      [],
      [],
    );

  it('inicia a execução para o mecânico atribuído', async () => {
    const order = makeOrder('mechanic-1');
    const repository = {
      findById: jest.fn().mockResolvedValue(order),
      save: jest.fn().mockResolvedValue(order),
    } as unknown as jest.Mocked<ServiceOrderRepository>;

    await new StartServiceUseCase(repository).execute(order.id, 'mechanic-1');

    expect(order.status).toBe(ServiceOrderStatus.IN_EXECUTION);
    expect(order.serviceStartedAt).toBeInstanceOf(Date);
    expect(repository.save).toHaveBeenCalledWith(order);
  });

  it('rejeita mecânico não atribuído', async () => {
    const order = makeOrder('mechanic-1');
    const repository = {
      findById: jest.fn().mockResolvedValue(order),
      save: jest.fn(),
    } as unknown as jest.Mocked<ServiceOrderRepository>;

    await expect(
      new StartServiceUseCase(repository).execute(order.id, 'mechanic-2'),
    ).rejects.toThrow(DomainError);
  });

  it('retorna erro quando a OS não existe', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    } as unknown as jest.Mocked<ServiceOrderRepository>;

    await expect(
      new StartServiceUseCase(repository).execute('missing-order', 'mechanic-1'),
    ).rejects.toThrow(NotFoundException);
  });
});
