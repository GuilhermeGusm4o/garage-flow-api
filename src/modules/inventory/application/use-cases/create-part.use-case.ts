import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';
import { PartRepository } from '@inventory/domain/repositories/part.repository';
import { CreatePartDto } from '@inventory/presentation/dtos/create-part.dto';

@Injectable()
export class CreatePartUseCase {
  constructor(private readonly partRepository: PartRepository) {}

  async execute(dto: CreatePartDto): Promise<Part> {
    const now = new Date();

    const part = Part.create({
      id: randomUUID(),
      name: dto.name,
      unitOfMeasure: new UnitOfMeasure(dto.unitOfMeasure),
      unitPrice: dto.unitPrice,
      quantity: new Quantity(dto.quantity ?? 0),
      minQuantity: new Quantity(dto.minQuantity ?? 0),
      createdAt: now,
      updatedAt: now,
    });

    await this.partRepository.save(part);
    return part;
  }
}
