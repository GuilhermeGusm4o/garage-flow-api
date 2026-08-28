import { type UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';

export class Part {
  constructor(
    public readonly id: string,
    public name: string,
    public unitOfMeasure: UnitOfMeasure,
    public unitPrice: number,
    public quantity: Quantity,
    public minQuantity: Quantity = new Quantity(0),
  ) {}

  restock(amountReceived: number): void {
    this.quantity = this.quantity.add(amountReceived);
  }

  consume(amountUsed: number): void {
    this.quantity = this.quantity.subtract(amountUsed);
  }

  /**
   * Baixa automática ao finalizar a OS. Diferente do `consume`, não bloqueia
   * quando falta peça: o estoque fica negativo para expor a divergência.
   */
  writeOff(amountUsed: number): void {
    this.quantity = this.quantity.subtractAllowingNegative(amountUsed);
  }

  updateDetails(name: string, unitPrice: number, minQuantity?: Quantity): void {
    this.name = name;
    this.unitPrice = unitPrice;
    if (minQuantity !== undefined) {
      this.minQuantity = minQuantity;
    }
  }

  isBelowMinimum(): boolean {
    return this.quantity.value < this.minQuantity.value;
  }
}
