import {
  TimestampedEntity,
  type TimestampedEntityProps,
} from '@common/entities/timestamped.entity';

export interface BaseEntityProps extends TimestampedEntityProps {
  deletedAt?: Date | null;
}

export abstract class BaseEntity extends TimestampedEntity {
  protected _deletedAt: Date | null;

  protected constructor(props: BaseEntityProps) {
    super(props);
    this._deletedAt = props.deletedAt ?? null;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  get isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.touch();
  }
}
