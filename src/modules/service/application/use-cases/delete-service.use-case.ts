import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceRepository } from '@service/domain/repositories/service.repository';

@Injectable()
export class DeleteServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(id: string): Promise<void> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    service.softDelete();
    await this.serviceRepository.update(service);
  }
}
