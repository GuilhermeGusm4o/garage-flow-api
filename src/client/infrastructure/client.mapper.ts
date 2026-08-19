import { type Client as ClientModel } from '@prisma/client';
import { type UUID } from 'crypto';
import { ClientEntity } from '@client/domain/entities/client.entity';
import { CpfCnpj } from '@client/domain/value-objects/cpf-cnpj-validator.vo';

export class ClientMapper {
  static toDomain(raw: ClientModel): ClientEntity {
    return ClientEntity.create({
      id: raw.id as UUID,
      cpfCnpj: CpfCnpj.create(raw.cpfCnpj),
      name: raw.name,
      phone: raw.phone,
      address: raw.address,
      email: raw.email,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      deletedAt: raw.deleted_at,
    });
  }

  static toPrisma(entity: ClientEntity): Omit<ClientModel, 'created_at' | 'updated_at'> {
    return {
      id: entity.id,
      cpfCnpj: entity.cpfCnpj.value,
      name: entity.name,
      phone: entity.phone,
      address: entity.address,
      email: entity.email,
      deleted_at: entity.deletedAt,
    };
  }
}
