import { describe, expect, it } from '@jest/globals';
import { ServicePrice } from '@service/domain/value-objects/service-price.value-object';
import { Decimal } from '@prisma/client/runtime/client';

describe('ServicePrice', () => {
  it('should create a valid price', () => {
    const price = ServicePrice.create(150);
    expect(price.getValue()).toEqual(new Decimal(150));
  });

  it('should create a price from string', () => {
    const price = ServicePrice.create('99.99');
    expect(price.getValue().toFixed(2)).toBe('99.99');
  });

  it('should create a price from Decimal', () => {
    const price = ServicePrice.create(new Decimal('200.50'));
    expect(price.getValue().toFixed(2)).toBe('200.50');
  });

  it('should allow zero price', () => {
    const price = ServicePrice.create(0);
    expect(price.getValue().toNumber()).toBe(0);
  });

  it('should throw when price is negative', () => {
    expect(() => ServicePrice.create(-1)).toThrow('Service price must be non-negative');
  });
});
