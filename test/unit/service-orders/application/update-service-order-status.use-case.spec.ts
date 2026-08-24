import { NotFoundException } from '@nestjs/common';
import { type WriteOffPartsUseCase } from '@inventory/application/use-cases/write-off-parts.use-case';
import { UpdateServiceOrderStatusUseCase } from '@service-orders/application/use-cases/update-service-order-status.use-case';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';

describe('UpdateServiceOrderStatusUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepository>;
  let writeOffParts: { execute: jest.Mock };
  let useCase: UpdateServiceOrderStatusUseCase;

  const buildServiceOrder = () => ServiceOrder.create('vehicle-1', 'Ruído no motor', [], [], 0);

  beforeEach(() => {
    repository = {
      save: jest.fn((serviceOrder) => Promise.resolve(serviceOrder)),
      findById: jest.fn().mockResolvedValue(buildServiceOrder()),
      findAll: jest.fn(),
      softDelete: jest.fn(),
    };

    writeOffParts = { execute: jest.fn().mockResolvedValue([]) };

    useCase = new UpdateServiceOrderStatusUseCase(
      repository,
      writeOffParts as unknown as WriteOffPartsUseCase,
    );
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

  describe('baixa automática de estoque', () => {
    it('baixa as peças da OS ao finalizar', async () => {
      const serviceOrder = ServiceOrder.create(
        'vehicle-1',
        'Ruído',
        [],
        [new PartItem(null, 'part-1', 3, 30), new PartItem(null, 'part-2', 1, 50)],
        140,
      );
      serviceOrder.updateStatus(ServiceOrderStatus.IN_EXECUTION);
      repository.findById.mockResolvedValue(serviceOrder);

      await useCase.execute('os-1', { status: ServiceOrderStatus.FINISHED });

      expect(writeOffParts.execute).toHaveBeenCalledWith([
        { inventoryId: 'part-1', quantity: 3 },
        { inventoryId: 'part-2', quantity: 1 },
      ]);
    });

    it('não baixa nada em transições que não finalizam', async () => {
      const serviceOrder = ServiceOrder.create('vehicle-1', 'Ruído', [], [], 0);
      repository.findById.mockResolvedValue(serviceOrder);

      await useCase.execute('os-1', { status: ServiceOrderStatus.IN_EXECUTION });

      expect(writeOffParts.execute).not.toHaveBeenCalled();
    });

    it('não baixa de novo quando a OS já estava finalizada', async () => {
      const serviceOrder = ServiceOrder.create('vehicle-1', 'Ruído', [], [], 0);
      serviceOrder.updateStatus(ServiceOrderStatus.FINISHED);
      repository.findById.mockResolvedValue(serviceOrder);

      await useCase.execute('os-1', { status: ServiceOrderStatus.FINISHED });

      expect(writeOffParts.execute).not.toHaveBeenCalled();
    });

    it('não baixa ao entregar uma OS que já havia sido finalizada', async () => {
      const serviceOrder = ServiceOrder.create('vehicle-1', 'Ruído', [], [], 0);
      serviceOrder.updateStatus(ServiceOrderStatus.FINISHED);
      repository.findById.mockResolvedValue(serviceOrder);

      await useCase.execute('os-1', { status: ServiceOrderStatus.DELIVERED });

      expect(writeOffParts.execute).not.toHaveBeenCalled();
    });
  });
});
