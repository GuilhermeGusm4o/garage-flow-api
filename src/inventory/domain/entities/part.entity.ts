import { UnitOfMeasure } from '../value-objects/unit-of-measure.vo';
import { Quantity } from '../value-objects/quantity.vo';

export class Part {
  private static readonly MINIMUM_QUANTITY = 5;

  constructor(
    public readonly id: string,
    public name: string,
    public unitOfMeasure: UnitOfMeasure,
    public unitPrice: number,
    public quantity: Quantity,
  ) {}

  restock(amountReceived: number): void {
    this.quantity = this.quantity.add(amountReceived);
  }

  consume(amountUsed: number): void {
    this.quantity = this.quantity.subtract(amountUsed);
  }

  isBelowMinimum(): boolean {
    return this.quantity.value < Part.MINIMUM_QUANTITY;
  }
}