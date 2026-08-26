import { randomUUID, type UUID } from 'node:crypto';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';

/** Data fixa no passado para que `touch()` sempre produza um `updatedAt` maior. */
export const FIXED_DATE = new Date('2026-01-01T00:00:00.000Z');

export interface MakeServiceOrderOverrides {
  id?: UUID;
  vehicleId?: string;
  description?: string;
  mechanicId?: string | null;
  status?: ServiceOrderStatus;
  approvedAt?: Date | null;
  totalAmount?: number;
  serviceItems?: ServiceItem[];
  partItems?: PartItem[];
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export function makeServiceOrder(overrides: MakeServiceOrderOverrides = {}): ServiceOrder {
  return new ServiceOrder(
    overrides.id ?? randomUUID(),
    overrides.vehicleId ?? randomUUID(),
    overrides.description ?? 'Ruído no motor',
    overrides.mechanicId ?? null,
    overrides.status ?? ServiceOrderStatus.RECEIVED,
    overrides.approvedAt ?? null,
    overrides.totalAmount ?? 0,
    overrides.serviceItems ?? [],
    overrides.partItems ?? [],
    overrides.updatedAt ?? FIXED_DATE,
    overrides.deletedAt ?? null,
  );
}

export function makeServiceItem(overrides: Partial<ServiceItem> = {}): ServiceItem {
  return new ServiceItem(
    overrides.id ?? randomUUID(),
    overrides.serviceId ?? randomUUID(),
    overrides.price ?? 100,
  );
}

export function makePartItem(overrides: Partial<PartItem> = {}): PartItem {
  return new PartItem(
    overrides.id ?? randomUUID(),
    overrides.inventoryId ?? randomUUID(),
    overrides.quantity ?? 1,
    overrides.unitPrice ?? 50,
    overrides.unitOfMeasure ?? 'UNIT',
  );
}

export function makeServiceOrderRepositoryMock(): jest.Mocked<ServiceOrderRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    softDelete: jest.fn(),
  };
}
