import { type ServicePrice } from 'src/modules/service/domain/value-objects/service-price.value-object';
import { BaseEntity, type BaseEntityProps } from '@common/entities/base.entity';

export interface ServiceProps extends BaseEntityProps {
  name: string;
  price: ServicePrice;
}

export class ServiceEntity extends BaseEntity {
  private _name: string;
  private _price: ServicePrice;

  private constructor(props: ServiceProps) {
    super(props);
    this._name = props.name;
    this._price = props.price;
  }

  static create(props: ServiceProps): ServiceEntity {
    return new ServiceEntity(props);
  }

  get name(): string {
    return this._name;
  }

  get price(): ServicePrice {
    return this._price;
  }

  update(name?: string, price?: ServicePrice): void {
    if (name !== undefined) this._name = name;
    if (price !== undefined) this._price = price;
    this.touch();
  }
}
