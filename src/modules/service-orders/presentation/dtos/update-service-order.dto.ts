import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

export class UpdateServiceOrderDto {
  @ApiPropertyOptional({ example: 'uuid-do-veiculo' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  vehicleId?: string;

  @ApiPropertyOptional({ example: 'uuid-do-mecanico', nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mechanicId?: string | null;

  @ApiPropertyOptional({ enum: ServiceOrderStatus })
  @IsOptional()
  @IsEnum(ServiceOrderStatus)
  status?: ServiceOrderStatus;

  @ApiPropertyOptional({ example: '2026-08-22T10:00:00.000Z', nullable: true })
  @IsOptional()
  @IsDateString()
  approvedAt?: string | null;
}
