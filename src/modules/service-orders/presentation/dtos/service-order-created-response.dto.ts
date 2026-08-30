import { ApiProperty } from '@nestjs/swagger';
import { type ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderResponseDto } from '@service-orders/presentation/dtos/service-order-response.dto';

export class ServiceOrderCreatedResponseDto extends ServiceOrderResponseDto {
  @ApiProperty({ description: "Public link for the client to track the service order's status" })
  trackingLink!: string;

  static fromEntityWithLink(
    entity: ServiceOrder,
    trackingLink: string,
  ): ServiceOrderCreatedResponseDto {
    const response = new ServiceOrderCreatedResponseDto();
    Object.assign(response, ServiceOrderResponseDto.fromEntity(entity));
    response.trackingLink = trackingLink;
    return response;
  }
}
