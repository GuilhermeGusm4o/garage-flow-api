import { ApiProperty } from '@nestjs/swagger';
import { type StockLevel } from '@inventory/domain/value-objects/stock-level.vo';
import { type AddServicesAndPartsResult } from '@service-orders/application/use-cases/add-services-and-parts.use-case';
import { ServiceOrderResponseDto } from '@service-orders/presentation/dtos/service-order-response.dto';

export class StockAlertResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  inventoryId!: string;

  @ApiProperty({ example: 'Óleo sintético 5W40' })
  name!: string;

  @ApiProperty({ example: 20, description: 'Quantidade física em estoque' })
  quantity!: number;

  @ApiProperty({ example: 18, description: 'Quantidade comprometida com OS em aberto' })
  reservedQuantity!: number;

  @ApiProperty({ example: 2, description: 'Estoque lógico: físico menos o comprometido' })
  availableQuantity!: number;

  @ApiProperty({ example: 10, description: 'Mínimo recomendado em estoque' })
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
      'Peças recém-adicionadas cujo estoque lógico ficou abaixo do mínimo recomendado. ' +
      'Vazio quando nenhuma peça disparou alerta.',
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
