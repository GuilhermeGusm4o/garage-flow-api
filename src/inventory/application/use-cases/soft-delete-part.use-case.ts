import { Injectable, NotFoundException } from '@nestjs/common';
import { PartRepository } from '@inventory/domain/repositories/part.repository';

@Injectable()
export class SoftDeletePartUseCase {
  constructor(private readonly partRepository: PartRepository) {}

  async execute(id: string): Promise<void> {
    const part = await this.partRepository.findById(id);
    if (!part) throw new NotFoundException('Peça não encontrada');

    await this.partRepository.softDelete(id);
  }
}
