import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateVehicleRequest {
  @ApiPropertyOptional({ example: 'Volkswagen', description: 'Marca do veículo' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: 'Gol', description: 'Modelo do veículo' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ example: 2020, description: 'Ano-modelo do veículo' })
  @IsInt()
  @IsOptional()
  year?: number;
}
