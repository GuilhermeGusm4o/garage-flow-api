import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type Part } from '@inventory/domain/entities/part.entity';

export class PartResponseDto {
  @ApiProperty({
    description: 'Inventory item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({ description: 'Inventory item name', example: 'Óleo sintético 5W40' })
  name!: string;

  @ApiProperty({ description: 'Unit of measure', example: 'ML' })
  unitOfMeasure!: string;

  @ApiProperty({ description: 'Unit price', example: 59.9 })
  unitPrice!: number;

  @ApiProperty({ description: 'Physical quantity in stock', example: 20 })
  quantity!: number;

  @ApiProperty({ description: 'Recommended minimum stock', example: 5 })
  minQuantity!: number;

  @ApiProperty({ description: 'Record creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Record last-update timestamp' })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Soft-delete timestamp, null while the record is active',
    nullable: true,
  })
  deletedAt!: Date | null;

  static fromEntity(part: Part): PartResponseDto {
    const response = new PartResponseDto();
    response.id = part.id;
    response.name = part.name;
    response.unitOfMeasure = part.unitOfMeasure.value;
    response.unitPrice = part.unitPrice;
    response.quantity = part.quantity.value;
    response.minQuantity = part.minQuantity.value;
    response.createdAt = part.createdAt;
    response.updatedAt = part.updatedAt;
    response.deletedAt = part.deletedAt;
    return response;
  }
}
