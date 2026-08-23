import { type LicensePlate } from '@vehicle/domain/value-objects/license-plate.vo';
import { BaseEntity, type BaseEntityProps } from '@common/entities/base.entity';

export interface VehicleProps extends BaseEntityProps {
  brand: string;
  model: string;
  licensePlate: LicensePlate;
  year: number;
  clientId: string;
}

export interface UpdateVehicleProps {
  brand?: string;
  model?: string;
  year?: number;
}

export class VehicleEntity extends BaseEntity {
  private _brand: string;
  private _model: string;
  private _licensePlate: LicensePlate;
  private _year: number;
  private _clientId: string;

  private constructor(props: VehicleProps) {
    super(props);
    this._brand = props.brand;
    this._model = props.model;
    this._licensePlate = props.licensePlate;
    this._year = props.year;
    this._clientId = props.clientId;
  }

  static create(props: VehicleProps): VehicleEntity {
    return new VehicleEntity(props);
  }

  get brand(): string {
    return this._brand;
  }

  get model(): string {
    return this._model;
  }

  get licensePlate(): LicensePlate {
    return this._licensePlate;
  }

  get year(): number {
    return this._year;
  }

  get clientId(): string {
    return this._clientId;
  }

  update(props: UpdateVehicleProps): void {
    if (props.brand !== undefined) this._brand = props.brand;
    if (props.model !== undefined) this._model = props.model;
    if (props.year !== undefined) this._year = props.year;
    this.touch();
  }
}
