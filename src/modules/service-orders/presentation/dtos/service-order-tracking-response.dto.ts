import { ApiProperty } from '@nestjs/swagger';
import { type ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

export class ServiceOrderTrackingResponseDto {
  @ApiProperty({ enum: ServiceOrderStatus })
  status!: ServiceOrderStatus;

  @ApiProperty({ description: 'Data da última atualização da OS' })
  updatedAt!: Date;

  static fromEntity(entity: ServiceOrder): ServiceOrderTrackingResponseDto {
    const response = new ServiceOrderTrackingResponseDto();
    response.status = entity.status;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}
