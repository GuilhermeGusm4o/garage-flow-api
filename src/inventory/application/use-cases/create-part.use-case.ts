import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Part } from '../../domain/entities/part.entity';
import { UnitOfMeasure } from '../../domain/value-objects/unit-of-measure.vo';
import { Quantity } from '../../domain/value-objects/quantity.vo';
import { PartRepository } from '../../domain/repositories/part.repository';
import { CreatePartDto } from '../../presentation/dtos/create-part.dto';

@Injectable()
export class CreatePartUseCase {
  constructor(private readonly partRepository: PartRepository) {}

  async execute(dto: CreatePartDto): Promise<Part> {
    const part = new Part(
      randomUUID(),
      dto.name,
      new UnitOfMeasure(dto.unitOfMeasure),
      dto.unitPrice,
      new Quantity(dto.quantity ?? 0),
    );

    await this.partRepository.save(part);
    return part;
  }
}
