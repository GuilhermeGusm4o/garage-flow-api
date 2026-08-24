import { randomUUID, type UUID } from 'node:crypto';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';

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
