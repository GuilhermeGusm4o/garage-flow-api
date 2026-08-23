import { type UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { type Quantity } from '@inventory/domain/value-objects/quantity.vo';
import { BaseEntity, type BaseEntityProps } from '@common/entities/base.entity';

export interface PartProps extends BaseEntityProps {
  name: string;
  unitOfMeasure: UnitOfMeasure;
  unitPrice: number;
  quantity: Quantity;
}

export class Part extends BaseEntity {
  private static readonly MINIMUM_QUANTITY = 5;

  private _name: string;
  private readonly _unitOfMeasure: UnitOfMeasure;
  private _unitPrice: number;
  private _quantity: Quantity;

  private constructor(props: PartProps) {
    super(props);
    this._name = props.name;
    this._unitOfMeasure = props.unitOfMeasure;
    this._unitPrice = props.unitPrice;
    this._quantity = props.quantity;
  }

  static create(props: PartProps): Part {
    return new Part(props);
  }

  get name(): string {
    return this._name;
  }

  get unitOfMeasure(): UnitOfMeasure {
    return this._unitOfMeasure;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }

  get quantity(): Quantity {
    return this._quantity;
  }

  restock(amountReceived: number): void {
    this._quantity = this._quantity.add(amountReceived);
    this.touch();
  }

  consume(amountUsed: number): void {
    this._quantity = this._quantity.subtract(amountUsed);
    this.touch();
  }

  updateDetails(name: string, unitPrice: number): void {
    this._name = name;
    this._unitPrice = unitPrice;
    this.touch();
  }

  isBelowMinimum(): boolean {
    return this._quantity.value < Part.MINIMUM_QUANTITY;
  }
}
