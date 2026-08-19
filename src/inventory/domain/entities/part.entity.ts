import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';

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

  updateDetails(name: string, unitPrice: number): void {
    this.name = name;
    this.unitPrice = unitPrice;
  }

  isBelowMinimum(): boolean {
    return this.quantity.value < Part.MINIMUM_QUANTITY;
  }
}
