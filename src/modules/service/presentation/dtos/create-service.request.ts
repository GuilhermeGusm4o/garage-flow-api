import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateServiceRequest {
  @ApiProperty({ example: 'Troca de óleo', description: "Service's name" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 150.0, description: "Service's price" })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  price!: number;
}
