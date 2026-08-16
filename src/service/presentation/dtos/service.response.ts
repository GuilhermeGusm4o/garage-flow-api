import { type ServiceEntity } from '@service/domain/entities/service.entity';

export class ServiceResponse {
  id!: string;
  name!: string;
  price!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;

  static fromEntity(entity: ServiceEntity): ServiceResponse {
    const response = new ServiceResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.price = entity.price.getValue().toFixed(2);
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}
