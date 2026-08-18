import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceRepository } from 'src/modules/service/domain/repositories/service.repository';
import { ServiceEntity } from 'src/modules/service/domain/entities/service.entity';

@Injectable()
export class FindServiceByIdUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(id: string): Promise<ServiceEntity> {
    const service = await this.serviceRepository.findById(id);
    if (!service || service.isDeleted) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    return service;
  }
}
