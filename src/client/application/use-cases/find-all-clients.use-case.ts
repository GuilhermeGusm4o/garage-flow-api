import { Injectable } from '@nestjs/common';
import { ClientRepository } from '@client/domain/repositories/client.repository';
import { ClientEntity } from '@client/domain/entities/client.entity';

@Injectable()
export class FindAllClientsUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(): Promise<ClientEntity[]> {
    return this.clientRepository.findAll();
  }
}
