import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ClientRepository } from '@client/domain/repositories/client.repository';
import { ClientEntity } from '@client/domain/entities/client.entity';
import { CpfCnpj, InvalidCpfCnpjError } from '@client/domain/value-objects/cpf-cnpj-validator.vo';

@Injectable()
export class FindClientByCpfCnpjUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(cpfCnpj: string): Promise<ClientEntity> {
    const normalized = this.parseCpfCnpj(cpfCnpj);
    const client = await this.clientRepository.findByCpfCnpj(normalized.value);
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  /** Traduz o erro de domínio do VO para o erro HTTP correspondente. */
  private parseCpfCnpj(value: string): CpfCnpj {
    try {
      return CpfCnpj.create(value);
    } catch (error) {
      if (error instanceof InvalidCpfCnpjError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
