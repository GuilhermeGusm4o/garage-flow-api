import {
  BaseDeletableEntity,
  type BaseDeletableEntityProps,
} from '@common/entities/base-deletable.entity';

export type UserRole = 'ADMIN' | 'MECHANIC' | 'SERVICE_ADVISOR' | 'STOCK_CLERK';

export interface UserProps extends BaseDeletableEntityProps {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export interface UpdateUserProps {
  name?: string;
  email?: string;
  passwordHash?: string;
  role?: UserRole;
}

export class User extends BaseDeletableEntity {
  private _name: string;
  private _email: string;
  private _passwordHash: string;
  private _role: UserRole;

  private constructor(props: UserProps) {
    super(props);
    this._name = props.name;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._role = props.role;
  }

  static create(props: UserProps): User {
    return new User(props);
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get role(): UserRole {
    return this._role;
  }

  update(props: UpdateUserProps): void {
    if (props.name !== undefined) this._name = props.name;
    if (props.email !== undefined) this._email = props.email;
    if (props.passwordHash !== undefined) this._passwordHash = props.passwordHash;
    if (props.role !== undefined) this._role = props.role;
    this.touch();
  }

  toJSON() {
    return {
      id: this.id,
      name: this._name,
      email: this._email,
      role: this._role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
