import { type UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { type Quantity } from '@inventory/domain/value-objects/quantity.vo';
import {
  BaseDeletableEntity,
  type BaseDeletableEntityProps,
} from '@common/entities/base-deletable.entity';

export interface PartProps extends BaseDeletableEntityProps {
  name: string;
  unitOfMeasure: UnitOfMeasure;
  unitPrice: number;
  quantity: Quantity;
  minQuantity: Quantity;
}

export class Part extends BaseDeletableEntity {
  private _name: string;
  private readonly _unitOfMeasure: UnitOfMeasure;
  private _unitPrice: number;
  private _quantity: Quantity;
  private _minQuantity: Quantity;

  private constructor(props: PartProps) {
    super(props);
    this._name = props.name;
    this._unitOfMeasure = props.unitOfMeasure;
    this._unitPrice = props.unitPrice;
    this._quantity = props.quantity;
    this._minQuantity = props.minQuantity;
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

  get minQuantity(): Quantity {
    return this._minQuantity;
  }

  restock(amountReceived: number): void {
    this._quantity = this._quantity.add(amountReceived);
    this.touch();
  }

  consume(amountUsed: number): void {
    this._quantity = this._quantity.subtract(amountUsed);
    this.touch();
  }

  /**
   * Baixa automática ao finalizar a OS. Diferente do `consume`, não bloqueia
   * quando falta peça: o estoque fica negativo para expor a divergência.
   */
  writeOff(amountUsed: number): void {
    this._quantity = this._quantity.subtractAllowingNegative(amountUsed);
    this.touch();
  }

  updateDetails(name: string, unitPrice: number, minQuantity?: Quantity): void {
    this._name = name;
    this._unitPrice = unitPrice;
    if (minQuantity !== undefined) {
      this._minQuantity = minQuantity;
    }
    this.touch();
  }

  isBelowMinimum(): boolean {
    return this._quantity.value < this._minQuantity.value;
  }
}
