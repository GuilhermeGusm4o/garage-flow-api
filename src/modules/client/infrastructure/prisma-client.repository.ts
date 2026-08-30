import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { ClientRepository } from '@client/domain/repositories/client.repository';
import { ClientEntity } from '@client/domain/entities/client.entity';
import { ClientMapper } from '@client/infrastructure/client.mapper';

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(client: ClientEntity): Promise<ClientEntity> {
    const raw = await this.prisma.client.create({
      data: ClientMapper.toPrisma(client),
    });
    return ClientMapper.toDomain(raw);
  }

  async findAll(): Promise<ClientEntity[]> {
    const raws = await this.prisma.client.findMany({
      where: { deleted_at: null },
    });
    return raws.map(ClientMapper.toDomain);
  }

  async findById(id: string): Promise<ClientEntity | null> {
    const raw = await this.prisma.client.findFirst({
      where: { id, deleted_at: null },
    });
    if (!raw) return null;
    return ClientMapper.toDomain(raw);
  }

  async findByCpfCnpj(cpfCnpj: string): Promise<ClientEntity | null> {
    const raw = await this.prisma.client.findFirst({
      where: { cpfCnpj, deleted_at: null },
    });
    if (!raw) return null;
    return ClientMapper.toDomain(raw);
  }

  async update(client: ClientEntity): Promise<ClientEntity> {
    const raw = await this.prisma.client.update({
      where: { id: client.id },
      data: ClientMapper.toPrisma(client),
    });
    return ClientMapper.toDomain(raw);
  }
}
