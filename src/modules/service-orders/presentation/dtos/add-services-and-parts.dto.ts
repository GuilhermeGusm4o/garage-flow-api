import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, IsNotEmpty, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ServiceItemDto {
  @ApiProperty({ description: 'Service ID', example: 'uuid-do-servico' })
  @IsString()
  @IsNotEmpty()
  serviceId!: string;
}

export class PartItemDto {
  @ApiProperty({ description: 'Inventory item ID', example: 'uuid-da-peca' })
  @IsString()
  @IsNotEmpty()
  inventoryId!: string;

  @ApiProperty({ description: 'Quantity of this part to use', example: 2 })
  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class AddServicesAndPartsDto {
  @ApiProperty({ description: 'Services performed on the service order', type: [ServiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceItemDto)
  services!: ServiceItemDto[];

  @ApiProperty({ description: 'Parts used on the service order', type: [PartItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartItemDto)
  parts!: PartItemDto[];
}
