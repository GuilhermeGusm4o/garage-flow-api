import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientRepository } from '@client/domain/repositories/client.repository';
import { ClientEntity } from '@client/domain/entities/client.entity';

@Injectable()
export class FindClientByCpfCnpjUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(cpfCnpj: string): Promise<ClientEntity> {
    const client = await this.clientRepository.findByCpfCnpj(cpfCnpj);
    if (!client) throw new NotFoundException('Cliente não encontrado');
    return client;
  }
}
