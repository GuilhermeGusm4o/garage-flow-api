import { makeServiceOrder, FIXED_DATE } from './service-order.factory';

describe('makeServiceOrder', () => {
  it('deve preencher updatedAt e deletedAt nas posições corretas', () => {
    const updatedAt = new Date('2026-08-26T12:00:00.000Z');
    const deletedAt = new Date('2026-08-26T13:00:00.000Z');

    const serviceOrder = makeServiceOrder({
      updatedAt,
      deletedAt,
    });

    expect(serviceOrder.serviceStartedAt).toBeNull();
    expect(serviceOrder.serviceFinishedAt).toBeNull();
    expect(serviceOrder.updatedAt).toBe(updatedAt);
    expect(serviceOrder.deletedAt).toBe(deletedAt);
  });

  it('deve usar a data fixa padrão quando updatedAt não for informado', () => {
    const serviceOrder = makeServiceOrder();

    expect(serviceOrder.updatedAt).toBe(FIXED_DATE);
  });
});
