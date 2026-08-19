import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type VehicleEntity } from '@vehicle/domain/entities/vehicle.entity';

export class VehicleResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Volkswagen' })
  brand!: string;

  @ApiProperty({ example: 'Gol' })
  model!: string;

  @ApiProperty({ example: 'ABC1D23' })
  licensePlate!: string;

  @ApiProperty({ example: 'MERCOSUL', enum: ['OLD', 'MERCOSUL'] })
  plateFormat!: string;

  @ApiProperty({ example: 2020 })
  year!: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  clientId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  deletedAt!: Date | null;

  static fromEntity(entity: VehicleEntity): VehicleResponse {
    const response = new VehicleResponse();
    response.id = entity.id;
    response.brand = entity.brand;
    response.model = entity.model;
    response.licensePlate = entity.licensePlate.format();
    response.plateFormat = entity.licensePlate.type;
    response.year = entity.year;
    response.clientId = entity.clientId;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.deletedAt = entity.deletedAt;
    return response;
  }
}
