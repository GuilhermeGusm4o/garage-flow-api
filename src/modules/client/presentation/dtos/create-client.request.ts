import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClientRequest {
  @ApiProperty({ example: '529.982.247-25', description: "Client's CPF or CNPJ" })
  @IsString()
  @IsNotEmpty()
  cpfCnpj!: string;

  @ApiProperty({ example: 'João da Silva', description: "Client's name" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '11999998888', description: "Client's phone number" })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'Rua das Flores, 123 - São Paulo/SP', description: 'Address' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiPropertyOptional({ example: 'joao@email.com', description: "Client's email" })
  @IsEmail()
  @IsOptional()
  email?: string;
}
