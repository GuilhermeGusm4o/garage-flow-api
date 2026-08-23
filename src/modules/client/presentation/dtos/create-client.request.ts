import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClientRequest {
  @ApiProperty({ example: '529.982.247-25', description: 'CPF ou CNPJ do cliente' })
  @IsString()
  @IsNotEmpty()
  cpfCnpj!: string;

  @ApiProperty({ example: 'João da Silva', description: 'Nome do cliente' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '11999998888', description: 'Telefone do cliente' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'Rua das Flores, 123 - São Paulo/SP', description: 'Endereço' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiPropertyOptional({ example: 'joao@email.com', description: 'E-mail do cliente' })
  @IsEmail()
  @IsOptional()
  email?: string;
}
