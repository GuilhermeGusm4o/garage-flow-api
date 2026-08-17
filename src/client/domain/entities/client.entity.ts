export interface ClientProps {
    id: string,
    cpf_cnpj: string,
    name?: string,
    phone: string,
    address?: string,
    email?: string,
}

export class Client {

    private constructor(
        private readonly props: ClientProps

    ) {}

    static create(props: ClientProps): Client {
        return new Client(props);
    }

    get id(): string {
        return this.props.id;
    }
    
    get cpf_cnpj(): string {
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