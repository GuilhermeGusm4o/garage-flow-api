import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

describe('ServiceOrder', () => {
  it('deve criar uma OS com status RECEIVED e a descrição informada', () => {
    const serviceItems = [new ServiceItem(null, 'service-1', 100)];
    const partItems = [new PartItem(null, 'part-1', 2, 50)];

    const os = ServiceOrder.create('vehicle-1', 'Ruído no motor', serviceItems, partItems, 200);

    expect(os.status).toBe(ServiceOrderStatus.RECEIVED);
    expect(os.vehicleId).toBe('vehicle-1');
    expect(os.description).toBe('Ruído no motor');
    expect(os.mechanicId).toBeNull();
  });

  it('deve armazenar o valor total recebido', () => {
    const serviceItems = [
      new ServiceItem(null, 'service-1', 100),
      new ServiceItem(null, 'service-2', 50),
    ];
    const partItems = [new PartItem(null, 'part-1', 2, 30)];

    const os = ServiceOrder.create('vehicle-1', 'Ruído no motor', serviceItems, partItems, 410);

    expect(os.totalAmount).toBe(410);
  });

  it('deve atualizar o status', () => {
    const os = ServiceOrder.create('vehicle-1', 'Ruído no motor', [], [], 0);
    os.updateStatus(ServiceOrderStatus.IN_DIAGNOSIS);
    expect(os.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
  });

  it('deve gerar um id único', () => {
    const os1 = ServiceOrder.create('vehicle-1', 'Ruído no motor', [], [], 0);
    const os2 = ServiceOrder.create('vehicle-1', 'Ruído no motor', [], [], 0);
    expect(os1.id).not.toBe(os2.id);
  });

  it('deve popular updatedAt na criação', () => {
    const os = ServiceOrder.create('vehicle-1', 'Ruído no motor', [], [], 0);
    expect(os.updatedAt).toBeInstanceOf(Date);
  });

  it('deve atualizar vehicleId, mechanicId, approvedAt e status via update()', () => {
    const os = ServiceOrder.create('vehicle-1', 'Ruído no motor', [], [], 0);
    const approvedAt = new Date('2026-08-22T10:00:00.000Z');

    os.update({
      vehicleId: 'vehicle-2',
      mechanicId: 'mechanic-1',
      status: ServiceOrderStatus.IN_DIAGNOSIS,
      approvedAt,
    });

    expect(os.vehicleId).toBe('vehicle-2');
    expect(os.mechanicId).toBe('mechanic-1');
    expect(os.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    expect(os.approvedAt).toBe(approvedAt);
  });

  it('deve permitir limpar mechanicId e approvedAt via update() passando null', () => {
    const os = ServiceOrder.create('vehicle-1', 'Ruído no motor', [], [], 0);
    os.update({ mechanicId: 'mechanic-1', approvedAt: new Date() });

    os.update({ mechanicId: null, approvedAt: null });

    expect(os.mechanicId).toBeNull();
    expect(os.approvedAt).toBeNull();
  });

  it('deve manter os campos não informados inalterados ao chamar update() parcialmente', () => {
    const os = ServiceOrder.create('vehicle-1', 'Ruído no motor', [], [], 0);
    os.update({ mechanicId: 'mechanic-1' });

    os.update({ status: ServiceOrderStatus.IN_EXECUTION });

    expect(os.vehicleId).toBe('vehicle-1');
    expect(os.mechanicId).toBe('mechanic-1');
    expect(os.status).toBe(ServiceOrderStatus.IN_EXECUTION);
  });

  it('não deve permitir alterar a descrição após a criação', () => {
    const os = ServiceOrder.create('vehicle-1', 'Ruído no motor', [], [], 0);

    os.update({ vehicleId: 'vehicle-2', status: ServiceOrderStatus.IN_DIAGNOSIS });

    expect(os.description).toBe('Ruído no motor');
  });

  it('deve adicionar serviços e peças preservando os itens já existentes', () => {
    const os = ServiceOrder.create(
      'vehicle-1',
      'Ruído no motor',
      [new ServiceItem(null, 'service-1', 100)],
      [new PartItem(null, 'part-1', 1, 30)],
      130,
    );

    os.addServicesAndParts(
      [new ServiceItem(null, 'service-2', 50)],
      [new PartItem(null, 'part-2', 2, 20)],
      220,
    );

    expect(os.serviceItems.map((item) => item.serviceId)).toEqual(['service-1', 'service-2']);
    expect(os.partItems.map((item) => item.inventoryId)).toEqual(['part-1', 'part-2']);
    expect(os.totalAmount).toBe(220);
  });
});
