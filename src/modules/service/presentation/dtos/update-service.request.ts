import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateServiceRequest {
  @ApiPropertyOptional({ example: 'Troca de óleo', description: 'Nome do serviço' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 150.0, description: 'Preço do serviço' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;
}
