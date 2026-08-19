import { type CpfCnpj } from '@client/domain/value-objects/cpf-cnpj-validator.vo';
import { BaseEntity, type BaseEntityProps } from '@common/entities/base.entity';

export interface ClientProps extends BaseEntityProps {
  cpfCnpj: CpfCnpj;
  name: string;
  phone: string;
  address: string;
  email?: string | null;
}

export interface UpdateClientProps {
  name?: string;
  phone?: string;
  address?: string;
  email?: string | null;
}

export class ClientEntity extends BaseEntity {
  private _cpfCnpj: CpfCnpj;
  private _name: string;
  private _phone: string;
  private _address: string;
  private _email: string | null;

  private constructor(props: ClientProps) {
    super(props);
    this._cpfCnpj = props.cpfCnpj;
    this._name = props.name;
    this._phone = props.phone;
    this._address = props.address;
    this._email = props.email ?? null;
  }

  static create(props: ClientProps): ClientEntity {
    return new ClientEntity(props);
  }

  get cpfCnpj(): CpfCnpj {
    return this._cpfCnpj;
  }

  get name(): string {
    return this._name;
  }

  get phone(): string {
    return this._phone;
  }

  get address(): string {
    return this._address;
  }

  get email(): string | null {
    return this._email;
  }

  update(props: UpdateClientProps): void {
    if (props.name !== undefined) this._name = props.name;
    if (props.phone !== undefined) this._phone = props.phone;
    if (props.address !== undefined) this._address = props.address;
    if (props.email !== undefined) this._email = props.email;
    this.touch();
  }
}
