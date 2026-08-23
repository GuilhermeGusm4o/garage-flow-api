export interface TimestampedEntityProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class TimestampedEntity {
  protected readonly _id: string;
  protected _createdAt: Date;
  protected _updatedAt: Date;

  protected constructor(props: TimestampedEntityProps) {
    this._id = props.id;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }
}
