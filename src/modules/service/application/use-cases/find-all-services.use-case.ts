import { Injectable } from '@nestjs/common';
import { ServiceRepository } from 'src/modules/service/domain/repositories/service.repository';
import { ServiceEntity } from 'src/modules/service/domain/entities/service.entity';

@Injectable()
export class FindAllServicesUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(): Promise<ServiceEntity[]> {
    return this.serviceRepository.findAll();
  }
}
