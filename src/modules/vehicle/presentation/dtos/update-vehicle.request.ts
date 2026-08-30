import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateVehicleRequest {
  @ApiPropertyOptional({ example: 'Volkswagen', description: "Vehicle's brand" })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: 'Gol', description: "Vehicle's model" })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ example: 2020, description: "Vehicle's model year" })
  @IsInt()
  @IsOptional()
  year?: number;
}
