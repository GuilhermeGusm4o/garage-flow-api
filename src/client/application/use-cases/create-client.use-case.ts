import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ClientRepository } from '@client/domain/repositories/client.repository';
import { ClientEntity } from '@client/domain/entities/client.entity';
import { CpfCnpj, InvalidCpfCnpjError } from '@client/domain/value-objects/cpf-cnpj-validator.vo';

export interface CreateClientInput {
  cpfCnpj: string;
  name: string;
  phone: string;
  address: string;
  email?: string | null;
}

@Injectable()
export class CreateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(input: CreateClientInput): Promise<ClientEntity> {
    const cpfCnpj = this.parseCpfCnpj(input.cpfCnpj);

    const existing = await this.clientRepository.findByCpfCnpj(cpfCnpj.value);
    if (existing) {
      throw new ConflictException(`Client with CPF/CNPJ ${cpfCnpj.format()} already exists`);
    }

    const now = new Date();

    const client = ClientEntity.create({
      id: randomUUID(),
      cpfCnpj,
      name: input.name,
      phone: input.phone,
      address: input.address,
      email: input.email,
      createdAt: now,
      updatedAt: now,
    });

    return this.clientRepository.create(client);
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
