import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

export class UpdateServiceOrderStatusDto {
  @ApiProperty({ enum: ServiceOrderStatus })
  @IsNotEmpty()
  @IsEnum(ServiceOrderStatus)
  status!: ServiceOrderStatus;
}
