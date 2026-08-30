import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateVehicleRequest {
  @ApiProperty({ example: 'Volkswagen', description: "Vehicle's brand" })
  @IsString()
  @IsNotEmpty()
  brand!: string;

  @ApiProperty({ example: 'Gol', description: "Vehicle's model" })
  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiProperty({ example: 'ABC1D23', description: 'License plate (old standard or Mercosul)' })
  @IsString()
  @IsNotEmpty()
  licensePlate!: string;

  @ApiProperty({ example: 2020, description: "Vehicle's model year" })
  @IsInt()
  year!: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: "Owner client's ID",
  })
  @IsUUID()
  clientId!: string;
}
