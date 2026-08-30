import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type ServiceEntity } from '@service/domain/entities/service.entity';

export class ServiceResponse {
  @ApiProperty({ description: 'Service ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: "Service's name", example: 'Troca de óleo' })
  name!: string;

  @ApiProperty({
    description: "Service's price, formatted with 2 decimal places",
    example: '150.00',
  })
  price!: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Record last-update timestamp' })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Soft-delete timestamp, null while the record is active',
    nullable: true,
  })
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
