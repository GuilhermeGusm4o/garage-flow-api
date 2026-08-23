import { DomainError } from '@common/errors/domain.error';

export class ServicePrice {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(value: number | string): ServicePrice {
    const numericValue = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(numericValue)) {
      throw new DomainError('Service price must be a valid number');
    }
    if (numericValue < 0) {
      throw new DomainError('Service price must be non-negative');
    }
    return new ServicePrice(numericValue);
  }

  getValue(): number {
    return this.value;
  }
}
