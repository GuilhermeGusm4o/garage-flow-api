import { BaseEntity, type BaseEntityProps } from '@common/entities/base.entity';

export interface BaseDeletableEntityProps extends BaseEntityProps {
  deletedAt?: Date | null;
}

export abstract class BaseDeletableEntity extends BaseEntity {
  protected _deletedAt: Date | null;

  protected constructor(props: BaseDeletableEntityProps) {
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
