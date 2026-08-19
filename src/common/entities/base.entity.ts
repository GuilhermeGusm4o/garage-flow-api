import { type UUID } from 'crypto';

export interface BaseEntityProps {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export abstract class BaseEntity {
  protected readonly _id: UUID;
  protected _createdAt: Date;
  protected _updatedAt: Date;
  protected _deletedAt: Date | null;

  protected constructor(props: BaseEntityProps) {
    this._id = props.id;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._deletedAt = props.deletedAt ?? null;
  }

  get id(): UUID {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  get isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.touch();
  }
}
