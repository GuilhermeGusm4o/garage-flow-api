import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateClientRequest {
  @ApiPropertyOptional({ example: 'João da Silva', description: "Client's name" })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '11999998888', description: "Client's phone number" })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Rua das Flores, 123 - São Paulo/SP', description: 'Address' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'joao@email.com', description: "Client's email" })
  @IsEmail()
  @IsOptional()
  email?: string;
}
