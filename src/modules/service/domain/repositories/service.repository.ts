import { type ServiceEntity } from 'src/modules/service/domain/entities/service.entity';

export abstract class ServiceRepository {
  abstract create(service: ServiceEntity): Promise<ServiceEntity>;
  abstract findAll(): Promise<ServiceEntity[]>;
  abstract findById(id: string): Promise<ServiceEntity | null>;
  abstract update(service: ServiceEntity): Promise<ServiceEntity>;
}
