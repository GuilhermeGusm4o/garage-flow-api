import { Injectable, NotFoundException } from '@nestjs/common';
import { PartRepository } from '@inventory/domain/repositories/part.repository';

@Injectable()
export class CalculateAvailabilityUseCase {
  constructor(private readonly partRepository: PartRepository) {}

  async execute(partId: string): Promise<number> {
    const part = await this.partRepository.findById(partId);
    if (!part) throw new NotFoundException('Peça não encontrada');

    return part.quantity.value;
  }
}
