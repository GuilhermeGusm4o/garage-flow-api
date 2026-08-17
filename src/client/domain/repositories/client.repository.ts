import { type ClientEntity } from '@client/domain/entities/client.entity';

export abstract class ClientRepository {
  abstract create(client: ClientEntity): Promise<ClientEntity>;
  abstract findByCpfCnpj(cpfCnpj: string): Promise<ClientEntity | null>;
}
