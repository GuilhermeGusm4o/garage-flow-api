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

  /**
   * True quando a OS ainda não estava finalizada e o novo status é FINISHED.
   * É o momento em que as peças saem definitivamente do estoque.
   */
  isFinishingWith(newStatus: ServiceOrderStatus | undefined): boolean {
    return this.status !== ServiceOrderStatus.FINISHED && newStatus === ServiceOrderStatus.FINISHED;
  }

  updateStatus(newStatus: ServiceOrderStatus): void {
    // TODO: add validation for status transitions
    this.status = newStatus;
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
