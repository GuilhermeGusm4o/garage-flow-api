import { Injectable } from '@nestjs/common';
import { Part } from '../../domain/entities/part.entity';
import { PartRepository } from '../../domain/repositories/part.repository';

@Injectable()
export class ListPartsUseCase {
  constructor(private readonly partRepository: PartRepository) {}

  async execute(): Promise<Part[]> {
    return this.partRepository.findAll();
  }
}