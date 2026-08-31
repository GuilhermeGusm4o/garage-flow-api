import { ApiProperty } from '@nestjs/swagger';
import { type StockLevel } from '@inventory/domain/value-objects/stock-level.vo';

export class LowStockPartResponseDto {
  @ApiProperty({
    description: 'Inventory item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({ description: 'Inventory item name', example: 'Óleo sintético 5W40' })
  name!: string;

  @ApiProperty({ description: 'Unit of measure', example: 'ML' })
  unitOfMeasure!: string;

  @ApiProperty({ example: 20, description: 'Physical quantity in stock' })
  physicalQuantity!: number;

  @ApiProperty({ example: 8, description: 'Quantity committed to open service orders' })
  reservedQuantity!: number;

  @ApiProperty({ example: 12, description: 'Logical stock: physical minus committed' })
  availableQuantity!: number;

  @ApiProperty({ example: 15, description: 'Recommended minimum stock' })
  minQuantity!: number;

  static fromStockLevel(level: StockLevel): LowStockPartResponseDto {
    const response = new LowStockPartResponseDto();
    response.id = level.part.id;
    response.name = level.part.name;
    response.unitOfMeasure = level.part.unitOfMeasure.value;
    response.physicalQuantity = level.part.quantity.value;
    response.reservedQuantity = level.reservedQuantity;
    response.availableQuantity = level.availableQuantity;
    response.minQuantity = level.part.minQuantity.value;
    return response;
  }
}
