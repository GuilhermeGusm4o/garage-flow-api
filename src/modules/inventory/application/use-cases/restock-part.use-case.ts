import { Injectable, NotFoundException } from '@nestjs/common';
import { Part } from '@inventory/domain/entities/part.entity';
import { PartRepository } from '@inventory/domain/repositories/part.repository';

@Injectable()
export class RestockPartUseCase {
  constructor(private readonly partRepository: PartRepository) {}

  async execute(id: string, quantityReceived: number): Promise<Part> {
    const part = await this.partRepository.findById(id);
    if (!part) throw new NotFoundException('Part not found');

    part.restock(quantityReceived);
    await this.partRepository.save(part);
    return part;
  }
}
