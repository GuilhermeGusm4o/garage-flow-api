import { BaseEntity, type BaseEntityProps } from '@common/entities/base.entity';

export interface ServiceItemProps extends BaseEntityProps {
  serviceId: string;
  price: number;
}

export class ServiceItem extends BaseEntity {
  private readonly _serviceId: string;
  private readonly _price: number;

  private constructor(props: ServiceItemProps) {
    super(props);
    this._serviceId = props.serviceId;
    this._price = props.price;
  }

  static create(serviceId: string, price: number): ServiceItem {
    const now = new Date();

    return new ServiceItem({
      id: crypto.randomUUID(),
      serviceId,
      price,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ServiceItemProps): ServiceItem {
    return new ServiceItem(props);
  }

  get serviceId(): string {
    return this._serviceId;
  }

  get price(): number {
    return this._price;
  }
}
