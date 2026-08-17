import { CpfCnpj } from '../value-objects/cpf-cnpj-validator.vo';

export interface ClientProps {
    id: string,
    cpf_cnpj: string,
    name?: string,
    phone: string,
    address?: string,
    email?: string,
}

type ClientState = Omit<ClientProps, 'cpf_cnpj'> & { cpf_cnpj: CpfCnpj };

export class Client {

    private constructor(
        private readonly props: ClientState
    ) {}

    static create(props: ClientProps): Client {
        return new Client({
            ...props,
            cpf_cnpj: CpfCnpj.create(props.cpf_cnpj),
        });
    }

    get id(): string {
        return this.props.id;
    }
    
    get cpf_cnpj(): CpfCnpj {
        return this.props.cpf_cnpj;
    }

    get name(): string | undefined {
        return this.props.name;
    }

    get phone(): string {
        return this.props.phone;
    }

    get address(): string | undefined {
        return this.props.address;
    }

    get email(): string | undefined {
        return this.props.email;
    }
}