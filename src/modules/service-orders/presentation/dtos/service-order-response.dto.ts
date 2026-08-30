import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { type ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { type PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type ServiceOrderListItem } from '@service-orders/domain/repositories/service-order.repository';

export class ServiceItemResponseDto {
  @ApiProperty({
    description: 'Service line item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({ description: 'Service ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  serviceId!: string;

  @ApiProperty({ description: 'Price billed for this service', example: 150.0 })
  price!: number;

  static fromEntity(entity: ServiceItem): ServiceItemResponseDto {
    const response = new ServiceItemResponseDto();
    response.id = entity.id;
    response.serviceId = entity.serviceId;
    response.price = entity.price;
    return response;
  }
}

export class PartItemResponseDto {
  @ApiProperty({
    description: 'Part line item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Inventory item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  inventoryId!: string;

  @ApiProperty({ description: 'Quantity used', example: 2 })
  quantity!: number;

  @ApiProperty({ description: 'Unit price billed', example: 59.9 })
  unitPrice!: number;

  @ApiPropertyOptional({
    description: 'Unit of measure',
    example: 'UNIT',
    nullable: true,
  })
  unitOfMeasure!: string | null;

  static fromEntity(entity: PartItem): PartItemResponseDto {
    const response = new PartItemResponseDto();
    response.id = entity.id;
    response.inventoryId = entity.inventoryId;
    response.quantity = entity.quantity;
    response.unitPrice = entity.unitPrice;
    response.unitOfMeasure = entity.unitOfMeasure;
    return response;
  }
}

export class ServiceOrderResponseDto {
  @ApiProperty({
    description: 'Service order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({ description: "Vehicle's ID", example: '123e4567-e89b-12d3-a456-426614174000' })
  vehicleId!: string;

  @ApiPropertyOptional({ description: "Vehicle's license plate", example: 'ABC1D23' })
  vehicleLicensePlate?: string;

  @ApiPropertyOptional({ description: "Client's name", example: 'João da Silva' })
  clientName?: string;

  @ApiPropertyOptional({ description: "Vehicle's brand", example: 'Volkswagen' })
  vehicleBrand?: string;

  @ApiPropertyOptional({ description: "Vehicle's model", example: 'Gol' })
  vehicleModel?: string;

  @ApiPropertyOptional({
    description: 'Friendly identifier for selecting the service order',
    example: 'ABC1D23 - João da Silva',
  })
  displayLabel?: string;

  @ApiProperty({ description: 'Client complaint reported when the service order was opened' })
  description!: string;

  @ApiPropertyOptional({
    description: 'Mechanic assigned to the service order, null until diagnosis starts',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  mechanicId!: string | null;

  @ApiProperty({
    description: 'Current status',
    enum: ServiceOrderStatus,
    example: ServiceOrderStatus.RECEIVED,
  })
  status!: ServiceOrderStatus;

  @ApiPropertyOptional({
    description: 'When the budget was approved, null until then',
    nullable: true,
  })
  approvedAt!: Date | null;

  @ApiProperty({ description: 'Sum of all services and parts', example: 410.0 })
  totalAmount!: number;

  @ApiProperty({
    description: 'Services performed on this service order',
    type: [ServiceItemResponseDto],
  })
  serviceItems!: ServiceItemResponseDto[];

  @ApiProperty({ description: 'Parts used on this service order', type: [PartItemResponseDto] })
  partItems!: PartItemResponseDto[];

  static fromEntity(entity: ServiceOrder): ServiceOrderResponseDto {
    const response = new ServiceOrderResponseDto();
    response.id = entity.id;
    response.vehicleId = entity.vehicleId;
    response.description = entity.description;
    response.mechanicId = entity.mechanicId;
    response.status = entity.status;
    response.approvedAt = entity.approvedAt;
    response.totalAmount = entity.totalAmount;
    response.serviceItems = entity.serviceItems.map(ServiceItemResponseDto.fromEntity);
    response.partItems = entity.partItems.map(PartItemResponseDto.fromEntity);
    return response;
  }

  static fromListItem(item: ServiceOrderListItem): ServiceOrderResponseDto {
    const response = new ServiceOrderResponseDto();
    response.id = item.id;
    response.vehicleId = item.vehicleId;
    response.vehicleLicensePlate = item.vehicleLicensePlate;
    response.clientName = item.clientName;
    response.vehicleBrand = item.vehicleBrand;
    response.vehicleModel = item.vehicleModel;
    response.displayLabel = `${item.vehicleLicensePlate} - ${item.clientName}`;
    response.description = item.description;
    response.mechanicId = item.mechanicId;
    response.status = item.status as ServiceOrderStatus;
    response.approvedAt = item.approvedAt;
    response.totalAmount = item.totalAmount;
    response.serviceItems = item.serviceItems.map(ServiceItemResponseDto.fromEntity);
    response.partItems = item.partItems.map(PartItemResponseDto.fromEntity);
    return response;
  }
}
