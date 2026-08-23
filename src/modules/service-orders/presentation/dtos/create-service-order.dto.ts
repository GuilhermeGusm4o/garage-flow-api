import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateServiceOrderDto {
  @ApiProperty({ example: '123.456.789-00', description: 'CPF ou CNPJ do cliente' })
  @IsString()
  @IsNotEmpty()
  clientCpfCnpj!: string;

  @ApiProperty({ example: 'ABC1D23', description: 'Placa do veículo' })
  @IsString()
  @IsNotEmpty()
  licensePlate!: string;

  @ApiProperty({
    example: 'Barulho estranho ao freiar e vibração no volante em alta velocidade',
    description: 'Reclamação do cliente relatada na abertura da OS',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
