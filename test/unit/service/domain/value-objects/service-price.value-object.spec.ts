import { describe, expect, it } from '@jest/globals';
import { ServicePrice } from '@service/domain/value-objects/service-price.value-object';

describe('ServicePrice', () => {
  it('should create a valid price', () => {
    const price = ServicePrice.create(150);
    expect(price.getValue()).toEqual(150);
  });

  it('should create a price from string', () => {
    const price = ServicePrice.create('99.99');
    expect(price.getValue().toFixed(2)).toBe('99.99');
  });

  it('should allow zero price', () => {
    const price = ServicePrice.create(0);
    expect(price.getValue()).toBe(0);
  });

  it('should throw when price is negative', () => {
    expect(() => ServicePrice.create(-1)).toThrow('Service price must be non-negative');
  });

  it('should throw when price is not a valid number', () => {
    expect(() => ServicePrice.create('abc')).toThrow('Service price must be a valid number');
  });
});
