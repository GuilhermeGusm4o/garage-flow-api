import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure as UnitOfMeasureVO } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';
import {
  type UnitOfMeasure as PrismaUnitOfMeasure,
  type Inventory as PrismaInventory,
} from '@generated/prisma/client';

export class PartMapper {
  static toDomain(row: PrismaInventory): Part {
    return new Part(
      row.id,
      row.name,
      new UnitOfMeasureVO(row.unitOfMeasure),
      Number(row.unitPrice),
      new Quantity(Number(row.quantity)),
    );
  }

  static toPersistence(part: Part) {
    return {
      id: part.id,
      name: part.name,
      unitOfMeasure: part.unitOfMeasure.value as PrismaUnitOfMeasure,
      unitPrice: part.unitPrice,
      quantity: part.quantity.value,
    };
  }
}
