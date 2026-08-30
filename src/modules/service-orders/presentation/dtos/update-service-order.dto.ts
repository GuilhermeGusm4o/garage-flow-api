import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateServiceOrderDto {
  @ApiPropertyOptional({ description: 'New vehicle ID', example: 'uuid-do-veiculo' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  vehicleId?: string;

  @ApiPropertyOptional({
    description: 'New assigned mechanic ID, or null to unassign',
    example: 'uuid-do-mecanico',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mechanicId?: string | null;

  @ApiPropertyOptional({
    description: 'New budget approval date, or null to clear it',
    example: '2026-08-22T10:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  approvedAt?: string | null;
}
