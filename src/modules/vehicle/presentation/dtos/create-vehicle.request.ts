import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateVehicleRequest {
  @ApiProperty({ example: 'Volkswagen', description: 'Marca do veículo' })
  @IsString()
  @IsNotEmpty()
  brand!: string;

  @ApiProperty({ example: 'Gol', description: 'Modelo do veículo' })
  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiProperty({ example: 'ABC1D23', description: 'Placa (padrão antigo ou Mercosul)' })
  @IsString()
  @IsNotEmpty()
  licensePlate!: string;

  @ApiProperty({ example: 2020, description: 'Ano-modelo do veículo' })
  @IsInt()
  year!: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do cliente proprietário',
  })
  @IsUUID()
  clientId!: string;
}
