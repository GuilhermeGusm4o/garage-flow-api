import { Injectable } from '@nestjs/common';
import { ServiceRepository } from '@service/domain/repositories/service.repository';
import { ServiceEntity } from '@service/domain/entities/service.entity';

@Injectable()
export class FindAllServicesUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(): Promise<ServiceEntity[]> {
    return this.serviceRepository.findAll();
  }
}
