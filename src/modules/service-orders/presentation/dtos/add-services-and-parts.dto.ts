import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, IsNotEmpty, ValidateNested, Min } from 'class-validator';
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
  @Min(1)
  quantity!: number;
}

export class AddServicesAndPartsDto {
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
