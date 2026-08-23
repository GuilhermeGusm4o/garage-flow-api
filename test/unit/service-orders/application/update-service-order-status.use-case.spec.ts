import { NotFoundException } from '@nestjs/common';
import { UpdateServiceOrderStatusUseCase } from '@service-orders/application/use-cases/update-service-order-status.use-case';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';

describe('UpdateServiceOrderStatusUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepository>;
  let useCase: UpdateServiceOrderStatusUseCase;

  const buildServiceOrder = () => ServiceOrder.create('vehicle-1', [], [], 0);

  beforeEach(() => {
    repository = {
      save: jest.fn((serviceOrder) => Promise.resolve(serviceOrder)),
      findById: jest.fn().mockResolvedValue(buildServiceOrder()),
      findAll: jest.fn(),
      softDelete: jest.fn(),
    };

    useCase = new UpdateServiceOrderStatusUseCase(repository);
  });

  it('deve atualizar exclusivamente o status da OS', async () => {
    const os = await useCase.execute('os-1', { status: ServiceOrderStatus.IN_DIAGNOSIS });

    expect(repository.findById).toHaveBeenCalledWith('os-1');
    expect(os.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    expect(os.vehicleId).toBe('vehicle-1');
    expect(repository.save).toHaveBeenCalledWith(os);
  });

  it('deve lançar NotFoundException se a OS não existir', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('os-inexistente', { status: ServiceOrderStatus.IN_DIAGNOSIS }),
    ).rejects.toThrow(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
