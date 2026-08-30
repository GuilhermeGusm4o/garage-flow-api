import { BaseEntity, type BaseEntityProps } from '@common/entities/base.entity';

export interface PartItemProps extends BaseEntityProps {
  inventoryId: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasure: string | null;
}

export class PartItem extends BaseEntity {
  private readonly _inventoryId: string;
  private readonly _quantity: number;
  private readonly _unitPrice: number;
  private readonly _unitOfMeasure: string | null;

  private constructor(props: PartItemProps) {
    super(props);
    this._inventoryId = props.inventoryId;
    this._quantity = props.quantity;
    this._unitPrice = props.unitPrice;
    this._unitOfMeasure = props.unitOfMeasure;
  }

  static create(
    inventoryId: string,
    quantity: number,
    unitPrice: number,
    unitOfMeasure: string | null = null,
  ): PartItem {
    const now = new Date();

    return new PartItem({
      id: crypto.randomUUID(),
      inventoryId,
      quantity,
      unitPrice,
      unitOfMeasure,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: PartItemProps): PartItem {
    return new PartItem(props);
  }

  get inventoryId(): string {
    return this._inventoryId;
  }

  get quantity(): number {
    return this._quantity;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }

  get unitOfMeasure(): string | null {
    return this._unitOfMeasure;
  }
}
