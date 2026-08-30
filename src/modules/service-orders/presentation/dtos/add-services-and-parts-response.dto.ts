import { ApiProperty } from '@nestjs/swagger';
import { type StockLevel } from '@inventory/domain/value-objects/stock-level.vo';
import { type AddServicesAndPartsResult } from '@service-orders/application/use-cases/add-services-and-parts.use-case';
import { ServiceOrderResponseDto } from '@service-orders/presentation/dtos/service-order-response.dto';

export class StockAlertResponseDto {
  @ApiProperty({
    description: 'Inventory item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  inventoryId!: string;

  @ApiProperty({ description: 'Inventory item name', example: 'Óleo sintético 5W40' })
  name!: string;

  @ApiProperty({ example: 20, description: 'Physical quantity in stock' })
  quantity!: number;

  @ApiProperty({ example: 18, description: 'Quantity committed to open service orders' })
  reservedQuantity!: number;

  @ApiProperty({ example: 2, description: 'Logical stock: physical minus committed' })
  availableQuantity!: number;

  @ApiProperty({ example: 10, description: 'Recommended minimum stock' })
  minQuantity!: number;

  static fromStockLevel(level: StockLevel): StockAlertResponseDto {
    const response = new StockAlertResponseDto();
    response.inventoryId = level.part.id;
    response.name = level.part.name;
    response.quantity = level.part.quantity.value;
    response.reservedQuantity = level.reservedQuantity;
    response.availableQuantity = level.availableQuantity;
    response.minQuantity = level.part.minQuantity.value;
    return response;
  }
}

export class AddServicesAndPartsResponseDto extends ServiceOrderResponseDto {
  @ApiProperty({
    type: [StockAlertResponseDto],
    description:
      'Recently added parts whose logical stock fell below the recommended minimum. ' +
      'Empty when no part triggered an alert.',
  })
  stockAlerts!: StockAlertResponseDto[];

  static fromResult(result: AddServicesAndPartsResult): AddServicesAndPartsResponseDto {
    const response = Object.assign(
      new AddServicesAndPartsResponseDto(),
      ServiceOrderResponseDto.fromEntity(result.serviceOrder),
    );
    response.stockAlerts = result.stockAlerts.map(StockAlertResponseDto.fromStockLevel);
    return response;
  }
}
