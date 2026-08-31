import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ServiceRepository } from '@service/domain/repositories/service.repository';
import { ServiceEntity } from '@service/domain/entities/service.entity';
import { ServicePrice } from '@service/domain/value-objects/service-price.value-object';

@Injectable()
export class CreateServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(name: string, price: number): Promise<ServiceEntity> {
    const servicePrice = ServicePrice.create(price);
    const now = new Date();

    const service = ServiceEntity.create({
      id: randomUUID(),
      name,
      price: servicePrice,
      createdAt: now,
      updatedAt: now,
    });

    return this.serviceRepository.create(service);
  }
}
