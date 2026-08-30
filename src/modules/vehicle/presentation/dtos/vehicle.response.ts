import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type VehicleEntity } from '@vehicle/domain/entities/vehicle.entity';

export class VehicleResponse {
  @ApiProperty({ description: 'Vehicle ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: "Vehicle's brand", example: 'Volkswagen' })
  brand!: string;

  @ApiProperty({ description: "Vehicle's model", example: 'Gol' })
  model!: string;

  @ApiProperty({ description: "Vehicle's formatted license plate", example: 'ABC1D23' })
  licensePlate!: string;

  @ApiProperty({
    description: 'License plate format',
    example: 'MERCOSUL',
    enum: ['OLD', 'MERCOSUL'],
  })
  plateFormat!: string;

  @ApiProperty({ description: "Vehicle's model year", example: 2020 })
  year!: number;

  @ApiProperty({
    description: "Owner client's ID",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  clientId!: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Record last-update timestamp' })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Soft-delete timestamp, null while the record is active',
    nullable: true,
  })
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
