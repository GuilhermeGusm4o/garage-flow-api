import { Decimal } from '@prisma/client/runtime/client';

export class ServicePrice {
  private readonly value: Decimal;

  private constructor(value: Decimal) {
    this.value = value;
  }

  static create(value: Decimal | number | string): ServicePrice {
    const decimal = new Decimal(value);
    if (decimal.lessThan(0)) {
      throw new Error('Service price must be non-negative');
    }
    return new ServicePrice(decimal);
  }

  getValue(): Decimal {
    return this.value;
  }
}
