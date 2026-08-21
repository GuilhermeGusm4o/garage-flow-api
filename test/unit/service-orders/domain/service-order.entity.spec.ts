import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

describe('ServiceOrder', () => {
  it('deve criar uma OS com status RECEIVED', () => {
    const serviceItems = [new ServiceItem(null, 'service-1', 100)];
    const partItems = [new PartItem(null, 'part-1', 2, 50)];

    const os = ServiceOrder.create('vehicle-1', serviceItems, partItems);

    expect(os.status).toBe(ServiceOrderStatus.RECEIVED);
    expect(os.vehicleId).toBe('vehicle-1');
    expect(os.mechanicId).toBeNull();
  });

  it('deve calcular o valor total corretamente (serviços + peças)', () => {
    const serviceItems = [
      new ServiceItem(null, 'service-1', 100),
      new ServiceItem(null, 'service-2', 50),
    ];
    const partItems = [new PartItem(null, 'part-1', 2, 30)]; // 2 * 30 = 60

    const os = ServiceOrder.create('vehicle-1', serviceItems, partItems);

    expect(os.totalAmount).toBe(210); // 100 + 50 + 60
  });

  it('deve atualizar o status', () => {
    const os = ServiceOrder.create('vehicle-1', [], []);
    os.updateStatus(ServiceOrderStatus.IN_DIAGNOSIS);
    expect(os.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
  });

  it('deve gerar um id único', () => {
    const os1 = ServiceOrder.create('vehicle-1', [], []);
    const os2 = ServiceOrder.create('vehicle-1', [], []);
    expect(os1.id).not.toBe(os2.id);
  });
});
