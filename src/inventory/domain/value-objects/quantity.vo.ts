export class Quantity {
  constructor(public readonly value: number) {
    if (value < 0) {
      throw new Error('Quantidade não pode ser negativa');
    }
  }

  add(amount: number): Quantity {
    return new Quantity(this.value + amount);
  }

  subtract(amount: number): Quantity {
    if (this.value - amount < 0) {
      throw new Error('Estoque insuficiente');
    }
    return new Quantity(this.value - amount);
  }
}
