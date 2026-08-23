import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { type PartItem } from '@service-orders/domain/entities/part-item.entity';

export interface UpdateServiceOrderProps {
  vehicleId?: string;
  mechanicId?: string | null;
  status?: ServiceOrderStatus;
  approvedAt?: Date | null;
}

export class ServiceOrder {
  constructor(
    public readonly id: string,
    public vehicleId: string,
    public readonly description: string,
    public mechanicId: string | null,
    public status: ServiceOrderStatus,
    public approvedAt: Date | null,
    public totalAmount: number,
    public serviceItems: ServiceItem[],
    public partItems: PartItem[],
    public serviceStartedAt: Date | null = null,
    public serviceFinishedAt: Date | null = null,
  ) {}

  static create(
    vehicleId: string,
    description: string,
    serviceItems: ServiceItem[],
    partItems: PartItem[],
    totalAmount: number,
  ): ServiceOrder {
    return new ServiceOrder(
      crypto.randomUUID(),
      vehicleId,
      description,
      null,
      ServiceOrderStatus.RECEIVED,
      null,
      totalAmount,
      serviceItems,
      partItems,
    );
  }

  updateStatus(newStatus: ServiceOrderStatus): void {
    // TODO: add validation for status transitions
    this.status = newStatus;
  }

  startDiagnosis(mechanicId: string): void {
    this.mechanicId = mechanicId;
    this.updateStatus(ServiceOrderStatus.IN_DIAGNOSIS);
  }

  finishService(mechanicId: string, finishedAt = new Date()): void {
    if (this.mechanicId !== mechanicId) {
      throw new Error('Only the mechanic assigned to the service order can finish it');
    }

    if (this.status !== ServiceOrderStatus.IN_EXECUTION) {
      throw new Error('Service order is not in execution');
    }

    this.updateStatus(ServiceOrderStatus.FINISHED);
    this.serviceFinishedAt = finishedAt;
  }

  update(props: UpdateServiceOrderProps): void {
    if (props.vehicleId !== undefined) this.vehicleId = props.vehicleId;
    if (props.mechanicId !== undefined) this.mechanicId = props.mechanicId;
    if (props.approvedAt !== undefined) this.approvedAt = props.approvedAt;
    if (props.status !== undefined) this.updateStatus(props.status);
  }

  addServicesAndParts(
    serviceItems: ServiceItem[],
    partItems: PartItem[],
    totalAmount: number,
  ): void {
    this.serviceItems = [...this.serviceItems, ...serviceItems];
    this.partItems = [...this.partItems, ...partItems];
    this.totalAmount = totalAmount;
  }
}
