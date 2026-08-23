import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure as UnitOfMeasureVO } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';
import {
  type UnitOfMeasure as PrismaUnitOfMeasure,
  type Inventory as PrismaInventory,
} from '@generated/prisma/client';

export class PartMapper {
  static toDomain(row: PrismaInventory): Part {
    return Part.create({
      id: row.id,
      name: row.name,
      unitOfMeasure: new UnitOfMeasureVO(row.unitOfMeasure),
      unitPrice: Number(row.unitPrice),
      quantity: new Quantity(Number(row.quantity)),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    });
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
