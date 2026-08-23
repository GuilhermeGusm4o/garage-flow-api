import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateClientRequest {
  @ApiPropertyOptional({ example: 'João da Silva', description: 'Nome do cliente' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '11999998888', description: 'Telefone do cliente' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Rua das Flores, 123 - São Paulo/SP', description: 'Endereço' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'joao@email.com', description: 'E-mail do cliente' })
  @IsEmail()
  @IsOptional()
  email?: string;
}
