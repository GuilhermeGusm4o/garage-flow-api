import { DomainError } from '@common/errors/domain.error';

export class Quantity {
  readonly value: number;

  constructor(value: number, allowNegative = false) {
    if (!allowNegative && value < 0) {
      throw new DomainError('Quantidade não pode ser negativa');
    }
    this.value = value;
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

  /**
   * Baixa que aceita resultado negativo. Usada apenas na baixa automática da OS:
   * o negativo registra divergência entre o estoque contábil e o físico, em vez
   * de impedir o fechamento do serviço.
   */
  subtractAllowingNegative(amount: number): Quantity {
    return new Quantity(this.value - amount, true);
  }

  toJSON() {
    return this.value;
  }
}
