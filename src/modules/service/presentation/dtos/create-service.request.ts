import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateServiceRequest {
  @ApiProperty({ example: 'Troca de óleo', description: 'Nome do serviço' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 150.0, description: 'Preço do serviço' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  price!: number;
}
