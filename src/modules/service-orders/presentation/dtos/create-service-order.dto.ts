import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ServiceItemDto {
  @ApiProperty({ example: 'uuid-do-servico' })
  @IsString()
  @IsNotEmpty()
  serviceId!: string;
}

export class PartItemDto {
  @ApiProperty({ example: 'uuid-da-peca' })
  @IsString()
  @IsNotEmpty()
  inventoryId!: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  quantity!: number;
}

export class CreateServiceOrderDto {
  @ApiProperty({ example: '123.456.789-00', description: 'CPF ou CNPJ do cliente' })
  @IsString()
  @IsNotEmpty()
  clientCpfCnpj!: string;

  @ApiProperty({ example: 'ABC1D23', description: 'Placa do veículo' })
  @IsString()
  @IsNotEmpty()
  licensePlate!: string;

  @ApiProperty({ type: [ServiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceItemDto)
  services!: ServiceItemDto[];

  @ApiProperty({ type: [PartItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartItemDto)
  parts!: PartItemDto[];
}
