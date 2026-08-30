import { randomUUID } from 'crypto';
import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';

/** Data fixa no passado para que `touch()` sempre produza um `updatedAt` maior. */
export const FIXED_DATE = new Date('2026-01-01T00:00:00.000Z');

export interface MakePartOverrides {
  id?: string;
  name?: string;
  unitOfMeasure?: UnitOfMeasure;
  unitPrice?: number;
  quantity?: Quantity;
  minQuantity?: Quantity;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export function makePart(overrides: MakePartOverrides = {}): Part {
  return Part.create({
    id: overrides.id ?? randomUUID(),
    name: overrides.name ?? 'Óleo de motor 5W30',
    unitOfMeasure: overrides.unitOfMeasure ?? new UnitOfMeasure('ML'),
    unitPrice: overrides.unitPrice ?? 45.9,
    quantity: overrides.quantity ?? new Quantity(20),
    minQuantity: overrides.minQuantity ?? new Quantity(5),
    createdAt: overrides.createdAt ?? FIXED_DATE,
    updatedAt: overrides.updatedAt ?? FIXED_DATE,
    deletedAt: overrides.deletedAt ?? null,
  });
}
