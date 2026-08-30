import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateServiceRequest {
  @ApiPropertyOptional({ example: 'Troca de óleo', description: "Service's name" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 150.0, description: "Service's price" })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;
}
