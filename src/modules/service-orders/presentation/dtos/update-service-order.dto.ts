import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

export class UpdateServiceOrderDto {
  @ApiProperty({ enum: ServiceOrderStatus, required: false })
  @IsOptional()
  @IsEnum(ServiceOrderStatus)
  status?: ServiceOrderStatus;
}
