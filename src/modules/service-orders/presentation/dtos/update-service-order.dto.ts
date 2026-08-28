import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  @ApiPropertyOptional({ example: '2026-08-22T10:00:00.000Z', nullable: true })
  @IsOptional()
  @IsDateString()
  approvedAt?: string | null;
}
