import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { Part } from '../domain/entities/part.entity';
import { PartRepository } from '../domain/repositories/part.repository';
import { PartMapper } from './part.mapper';

@Injectable()
export class PrismaPartRepository extends PartRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
 }

  async save(part: Part): Promise<void> {
    const data = PartMapper.toPersistence(part);
    await this.prisma.inventory.upsert({
      where: { id: part.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Part | null> {
    const row = await this.prisma.inventory.findUnique({ where: { id } });
    return row ? PartMapper.toDomain(row) : null;
  }

  async findAll(): Promise<Part[]> {
    const rows = await this.prisma.inventory.findMany();
    return rows.map(PartMapper.toDomain);
  }

  async findBelowMinimum(): Promise<Part[]> {
    const rows = await this.prisma.inventory.findMany();
    return rows.map(PartMapper.toDomain).filter((p) => p.isBelowMinimum());
  }
}