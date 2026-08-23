import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

describe('ServiceOrder', () => {
  it('deve criar uma OS com status RECEIVED', () => {
    const serviceItems = [new ServiceItem(null, 'service-1', 100)];
    const partItems = [new PartItem(null, 'part-1', 2, 50)];

    const os = ServiceOrder.create('vehicle-1', serviceItems, partItems, 200);

    expect(os.status).toBe(ServiceOrderStatus.RECEIVED);
    expect(os.vehicleId).toBe('vehicle-1');
    expect(os.mechanicId).toBeNull();
  });

  it('deve armazenar o valor total recebido', () => {
    const serviceItems = [
      new ServiceItem(null, 'service-1', 100),
      new ServiceItem(null, 'service-2', 50),
    ];
    const partItems = [new PartItem(null, 'part-1', 2, 30)];

    const os = ServiceOrder.create('vehicle-1', serviceItems, partItems, 410);

    expect(os.totalAmount).toBe(410);
  });

  it('deve atualizar o status', () => {
    const os = ServiceOrder.create('vehicle-1', [], [], 0);
    os.updateStatus(ServiceOrderStatus.IN_DIAGNOSIS);
    expect(os.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
  });

  it('deve gerar um id único', () => {
    const os1 = ServiceOrder.create('vehicle-1', [], [], 0);
    const os2 = ServiceOrder.create('vehicle-1', [], [], 0);
    expect(os1.id).not.toBe(os2.id);
  });
});
