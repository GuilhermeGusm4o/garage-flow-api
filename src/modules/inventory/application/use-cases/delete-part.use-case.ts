import { Injectable, NotFoundException } from '@nestjs/common';
import { PartRepository } from '@inventory/domain/repositories/part.repository';

@Injectable()
export class DeletePartUseCase {
  constructor(private readonly partRepository: PartRepository) {}

  async execute(id: string): Promise<void> {
    const part = await this.partRepository.findById(id);
    if (!part) throw new NotFoundException('Part not found');

    part.softDelete();
    await this.partRepository.save(part);
  }
}
