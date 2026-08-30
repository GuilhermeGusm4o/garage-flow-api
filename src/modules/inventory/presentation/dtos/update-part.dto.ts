import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePartDto {
  @ApiProperty({ description: 'Inventory item name', example: 'Óleo sintético 5W40' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Unit price', example: 59.9 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiPropertyOptional({ example: 15, description: 'Recommended minimum stock' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minQuantity?: number;
}
