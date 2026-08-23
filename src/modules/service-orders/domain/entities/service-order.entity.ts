import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { type PartItem } from '@service-orders/domain/entities/part-item.entity';
import { BaseEntity, type BaseEntityProps } from '@common/entities/base.entity';

export interface ServiceOrderProps extends BaseEntityProps {
  vehicleId: string;
  description: string;
  mechanicId: string | null;
  status: ServiceOrderStatus;
  approvedAt: Date | null;
  totalAmount: number;
  serviceItems: ServiceItem[];
  partItems: PartItem[];
}

export interface UpdateServiceOrderProps {
  vehicleId?: string;
  mechanicId?: string | null;
  status?: ServiceOrderStatus;
  approvedAt?: Date | null;
}

export class ServiceOrder extends BaseEntity {
  private _vehicleId: string;
  private readonly _description: string;
  private _mechanicId: string | null;
  private _status: ServiceOrderStatus;
  private _approvedAt: Date | null;
  private _totalAmount: number;
  private _serviceItems: ServiceItem[];
  private _partItems: PartItem[];

  private constructor(props: ServiceOrderProps) {
    super(props);
    this._vehicleId = props.vehicleId;
    this._description = props.description;
    this._mechanicId = props.mechanicId;
    this._status = props.status;
    this._approvedAt = props.approvedAt;
    this._totalAmount = props.totalAmount;
    this._serviceItems = props.serviceItems;
    this._partItems = props.partItems;
  }

  static create(
    vehicleId: string,
    description: string,
    serviceItems: ServiceItem[],
    partItems: PartItem[],
    totalAmount: number,
  ): ServiceOrder {
    const now = new Date();

    return new ServiceOrder({
      id: crypto.randomUUID(),
      vehicleId,
      description,
      mechanicId: null,
      status: ServiceOrderStatus.RECEIVED,
      approvedAt: null,
      totalAmount,
      serviceItems,
      partItems,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ServiceOrderProps): ServiceOrder {
    return new ServiceOrder(props);
  }

  get vehicleId(): string {
    return this._vehicleId;
  }

  get description(): string {
    return this._description;
  }

  get mechanicId(): string | null {
    return this._mechanicId;
  }

  get status(): ServiceOrderStatus {
    return this._status;
  }

  get approvedAt(): Date | null {
    return this._approvedAt;
  }

  get totalAmount(): number {
    return this._totalAmount;
  }

  get serviceItems(): ServiceItem[] {
    return this._serviceItems;
  }

  get partItems(): PartItem[] {
    return this._partItems;
  }

  updateStatus(newStatus: ServiceOrderStatus): void {
    // TODO: add validation for status transitions
    this._status = newStatus;
    this.touch();
  }

  update(props: UpdateServiceOrderProps): void {
    if (props.vehicleId !== undefined) this._vehicleId = props.vehicleId;
    if (props.mechanicId !== undefined) this._mechanicId = props.mechanicId;
    if (props.approvedAt !== undefined) this._approvedAt = props.approvedAt;
    if (props.status !== undefined) this.updateStatus(props.status);
    this.touch();
  }

  addServicesAndParts(
    serviceItems: ServiceItem[],
    partItems: PartItem[],
    totalAmount: number,
  ): void {
    this._serviceItems = [...this._serviceItems, ...serviceItems];
    this._partItems = [...this._partItems, ...partItems];
    this._totalAmount = totalAmount;
    this.touch();
  }
}
