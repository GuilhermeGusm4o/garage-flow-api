import { DomainError } from '@common/errors/domain.error';

export class Quantity {
  constructor(public readonly value: number) {
    if (value < 0) {
      throw new DomainError('Quantidade não pode ser negativa');
    }
  }

  add(amount: number): Quantity {
    return new Quantity(this.value + amount);
  }

  subtract(amount: number): Quantity {
    if (this.value - amount < 0) {
      throw new DomainError('Estoque insuficiente');
    }
    return new Quantity(this.value - amount);
  }

  toJSON() {
    return this.value;
  }
}
