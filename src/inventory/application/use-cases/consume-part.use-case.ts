import { Injectable, NotFoundException } from '@nestjs/common';
import { Part } from '../../domain/entities/part.entity';
import { PartRepository } from '../../domain/repositories/part.repository';

@Injectable()
export class ConsumePartUseCase {
  constructor(private readonly partRepository: PartRepository) {}

  async execute(id: string, quantityUsed: number): Promise<Part> {
    const part = await this.partRepository.findById(id);
    if (!part) throw new NotFoundException('Peça não encontrada');

    part.consume(quantityUsed);
    await this.partRepository.save(part);
    return part;
  }
}