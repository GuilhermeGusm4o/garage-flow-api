import { ApiProperty } from '@nestjs/swagger';
import { type StockLevel } from '@inventory/domain/value-objects/stock-level.vo';

export class LowStockPartResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Óleo sintético 5W40' })
  name!: string;

  @ApiProperty({ example: 'ML' })
  unitOfMeasure!: string;

  @ApiProperty({ example: 20, description: 'Quantidade física em estoque' })
  quantity!: number;

  @ApiProperty({ example: 8, description: 'Quantidade comprometida com OS em aberto' })
  reservedQuantity!: number;

  @ApiProperty({ example: 12, description: 'Estoque lógico: físico menos o comprometido' })
  availableQuantity!: number;

  @ApiProperty({ example: 15, description: 'Mínimo recomendado em estoque' })
  minQuantity!: number;

  static fromStockLevel(level: StockLevel): LowStockPartResponseDto {
    const response = new LowStockPartResponseDto();
    response.id = level.part.id;
    response.name = level.part.name;
    response.unitOfMeasure = level.part.unitOfMeasure.value;
    response.quantity = level.part.quantity.value;
    response.reservedQuantity = level.reservedQuantity;
    response.availableQuantity = level.availableQuantity;
    response.minQuantity = level.part.minQuantity.value;
    return response;
  }
}
