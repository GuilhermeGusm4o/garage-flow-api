import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { type ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { type PartItem } from '@service-orders/domain/entities/part-item.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

export class ServiceItemResponseDto {
  @ApiProperty()
  id!: string;

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
  @ApiProperty()
  id!: string;

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
}
