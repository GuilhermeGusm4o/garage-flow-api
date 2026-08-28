import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { type ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { type PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type ServiceOrderListItem } from '@service-orders/domain/repositories/service-order.repository';

export class ServiceItemResponseDto {
  @ApiPropertyOptional({ nullable: true })
  id!: string | null;

  @ApiProperty()
  serviceId!: string;

  @ApiProperty()
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
  @ApiPropertyOptional({ nullable: true })
  id!: string | null;

  @ApiProperty()
  inventoryId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPrice!: number;

  @ApiPropertyOptional({ nullable: true })
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
  @ApiProperty()
  id!: string;

  @ApiProperty()
  vehicleId!: string;

  @ApiPropertyOptional({ description: 'Placa do veículo' })
  vehicleLicensePlate?: string;

  @ApiPropertyOptional({ description: 'Nome do cliente' })
  clientName?: string;

  @ApiPropertyOptional({ description: 'Marca do veículo' })
  vehicleBrand?: string;

  @ApiPropertyOptional({ description: 'Modelo do veículo' })
  vehicleModel?: string;

  @ApiPropertyOptional({ description: 'Identificação amigável para seleção da OS' })
  displayLabel?: string;

  @ApiProperty({ description: 'Reclamação do cliente relatada na abertura da OS' })
  description!: string;

  @ApiPropertyOptional({ nullable: true })
  mechanicId!: string | null;

  @ApiProperty({ enum: ServiceOrderStatus })
  status!: ServiceOrderStatus;

  @ApiPropertyOptional({ nullable: true })
  approvedAt!: Date | null;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty({ type: [ServiceItemResponseDto] })
  serviceItems!: ServiceItemResponseDto[];

  @ApiProperty({ type: [PartItemResponseDto] })
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
