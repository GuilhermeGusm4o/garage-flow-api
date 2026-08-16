import { describe, expect, it } from '@jest/globals';
import { ServiceEntity } from '@service/domain/entities/service.entity';
import { ServicePrice } from '@service/domain/value-objects/service-price.value-object';
import { type UUID } from 'crypto';

const makeService = (overrides = {}): ServiceEntity =>
  ServiceEntity.create({
    id: '123e4567-e89b-12d3-a456-426614174000' as UUID,
    name: 'Troca de óleo',
    price: ServicePrice.create(150),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    ...overrides,
  });

describe('ServiceEntity', () => {
  it('should create a service entity', () => {
    const service = makeService();
    expect(service.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(service.name).toBe('Troca de óleo');
    expect(service.price.getValue().toNumber()).toBe(150);
    expect(service.isDeleted).toBe(false);
    expect(service.deletedAt).toBeNull();
  });

  it('should update name and price', () => {
    const service = makeService();
    service.update('Alinhamento', ServicePrice.create(200));
    expect(service.name).toBe('Alinhamento');
    expect(service.price.getValue().toNumber()).toBe(200);
  });

  it('should update only name', () => {
    const service = makeService();
    service.update('Balanceamento');
    expect(service.name).toBe('Balanceamento');
    expect(service.price.getValue().toNumber()).toBe(150);
  });

  it('should update updatedAt when updated', () => {
    const service = makeService();
    const before = service.updatedAt;
    service.update('Novo nome');
    expect(service.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should soft delete the service', () => {
    const service = makeService();
    service.softDelete();
    expect(service.isDeleted).toBe(true);
    expect(service.deletedAt).not.toBeNull();
  });
});
