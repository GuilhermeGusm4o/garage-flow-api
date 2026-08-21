import { ApiProperty } from '@nestjs/swagger';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

export class ServiceItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  serviceId!: string;

  @ApiProperty()
  price!: number;
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
}

export class ServiceOrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  vehicleId!: string;

  @ApiProperty({ required: false, nullable: true })
  mechanicId!: string | null;

  @ApiProperty({ enum: ServiceOrderStatus })
  status!: ServiceOrderStatus;

  @ApiProperty({ required: false, nullable: true })
  approvedAt!: Date | null;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty({ type: [ServiceItemResponseDto] })
  serviceItems!: ServiceItemResponseDto[];

  @ApiProperty({ type: [PartItemResponseDto] })
  partItems!: PartItemResponseDto[];
}
