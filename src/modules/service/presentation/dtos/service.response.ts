import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type ServiceEntity } from 'src/modules/service/domain/entities/service.entity';

export class ServiceResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Troca de óleo' })
  name!: string;

  @ApiProperty({ example: '150.00' })
  price!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  deletedAt!: Date | null;

  static fromEntity(entity: ServiceEntity): ServiceResponse {
    const response = new ServiceResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.price = entity.price.getValue().toFixed(2);
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.deletedAt = entity.deletedAt;
    return response;
  }
}
