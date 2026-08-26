import { NotFoundException } from '@nestjs/common';
import { RejectServiceOrderBudgetUseCase } from '@service-orders/application/use-cases/reject-service-order-budget.use-case';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';

describe('RejectServiceOrderBudgetUseCase', () => {
  it('reprova o orçamento e cancela a OS', async () => {
    const serviceOrder = ServiceOrder.create('vehicle-1', 'Ruído no motor', [], [], 0);
    serviceOrder.status = ServiceOrderStatus.AWAITING_APPROVAL;
    const repository = {
      findById: jest.fn().mockResolvedValue(serviceOrder),
      save: jest.fn().mockResolvedValue(serviceOrder),
    } as unknown as jest.Mocked<ServiceOrderRepository>;

    const result = await new RejectServiceOrderBudgetUseCase(repository).execute(serviceOrder.id);

    expect(result.status).toBe(ServiceOrderStatus.CANCELED);
    expect(result.approvedAt).toBeNull();
    expect(repository.save).toHaveBeenCalledWith(serviceOrder);
  });

  it('retorna erro quando a OS não existe', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    } as unknown as jest.Mocked<ServiceOrderRepository>;

    await expect(
      new RejectServiceOrderBudgetUseCase(repository).execute('missing-order'),
    ).rejects.toThrow(NotFoundException);
  });
});
