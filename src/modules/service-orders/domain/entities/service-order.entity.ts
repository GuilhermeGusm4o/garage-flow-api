import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { type PartItem } from '@service-orders/domain/entities/part-item.entity';
import { DomainError } from '@common/errors/domain.error';

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
    public readonly updatedAt: Date = new Date(),
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
      new Date(),
    );
  }

  updateStatus(newStatus: ServiceOrderStatus): void {
    const allowedTransitions: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
      [ServiceOrderStatus.RECEIVED]: [ServiceOrderStatus.IN_DIAGNOSIS, ServiceOrderStatus.CANCELED],
      [ServiceOrderStatus.IN_DIAGNOSIS]: [
        ServiceOrderStatus.FINISHED_DIAGNOSIS,
        ServiceOrderStatus.CANCELED,
      ],
      [ServiceOrderStatus.FINISHED_DIAGNOSIS]: [
        ServiceOrderStatus.AWAITING_APPROVAL,
        ServiceOrderStatus.CANCELED,
      ],
      [ServiceOrderStatus.AWAITING_APPROVAL]: [
        ServiceOrderStatus.AWAITING_EXECUTION,
        ServiceOrderStatus.CANCELED,
      ],
      [ServiceOrderStatus.AWAITING_EXECUTION]: [
        ServiceOrderStatus.IN_EXECUTION,
        ServiceOrderStatus.CANCELED,
      ],
      [ServiceOrderStatus.IN_EXECUTION]: [ServiceOrderStatus.FINISHED, ServiceOrderStatus.CANCELED],
      [ServiceOrderStatus.FINISHED]: [ServiceOrderStatus.DELIVERED],
      [ServiceOrderStatus.DELIVERED]: [],
      [ServiceOrderStatus.CANCELED]: [],
    };

    if (!allowedTransitions[this.status].includes(newStatus)) {
      throw new DomainError(
        `Invalid service order status transition: ${this.status} -> ${newStatus}`,
      );
    }

    this.status = newStatus;
  }

  startDiagnosis(mechanicId: string): void {
    this.updateStatus(ServiceOrderStatus.IN_DIAGNOSIS);
    this.mechanicId = mechanicId;
  }

  finishService(mechanicId: string, finishedAt = new Date()): void {
    if (this.mechanicId !== mechanicId) {
      throw new DomainError('Only the mechanic assigned to the service order can finish it');
    }

    this.updateStatus(ServiceOrderStatus.FINISHED);
    this.serviceFinishedAt = finishedAt;
  }

  approveBudget(approvedAt = new Date()): void {
    this.updateStatus(ServiceOrderStatus.AWAITING_EXECUTION);
    this.approvedAt = approvedAt;
  }

  rejectBudget(): void {
    this.updateStatus(ServiceOrderStatus.CANCELED);
    this.approvedAt = null;
  }

  update(props: UpdateServiceOrderProps): void {
    if (props.vehicleId !== undefined) this.vehicleId = props.vehicleId;
    if (props.mechanicId !== undefined) this.mechanicId = props.mechanicId;
    if (props.approvedAt !== undefined) this.approvedAt = props.approvedAt;
    if (props.status !== undefined) this.updateStatus(props.status);
  }

  addServicesAndParts(
    mechanicId: string,
    serviceItems: ServiceItem[],
    partItems: PartItem[],
    totalAmount: number,
  ): void {
    if (this.mechanicId !== mechanicId) {
      throw new DomainError('Only the mechanic assigned to the service order can finish it');
    }

    if (this.status !== ServiceOrderStatus.IN_DIAGNOSIS) {
      throw new DomainError('Service order must be in diagnosis to finish diagnosis');
    }

    this.updateStatus(ServiceOrderStatus.FINISHED_DIAGNOSIS);

    this.serviceItems = [...this.serviceItems, ...serviceItems];
    this.partItems = [...this.partItems, ...partItems];
    this.totalAmount = totalAmount;
  }
}
