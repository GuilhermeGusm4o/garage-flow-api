import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePartDto {
  @ApiProperty({ description: 'Inventory item name', example: 'Óleo sintético 5W40' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'ML',
    enum: UnitOfMeasure.getValidValues(),
  })
  @IsIn(UnitOfMeasure.getValidValues())
  unitOfMeasure!: string;

  @ApiProperty({ description: 'Unit price', example: 59.9 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiPropertyOptional({
    description: 'Initial physical quantity in stock',
    example: 20,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Recommended minimum stock', example: 5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minQuantity?: number;
}
