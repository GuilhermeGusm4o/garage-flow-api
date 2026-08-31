import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateServiceOrderDto {
  @ApiProperty({ example: '123.456.789-00', description: "Client's CPF or CNPJ" })
  @IsString()
  @IsNotEmpty()
  clientCpfCnpj!: string;

  @ApiProperty({ example: 'ABC1D23', description: "Vehicle's license plate" })
  @IsString()
  @IsNotEmpty()
  licensePlate!: string;

  @ApiProperty({
    example: 'Barulho estranho ao freiar e vibração no volante em alta velocidade',
    description: 'Client complaint reported when the service order was opened',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
