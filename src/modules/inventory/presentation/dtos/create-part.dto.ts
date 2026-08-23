import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePartDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsIn(UnitOfMeasure.getValidValues())
  unitOfMeasure!: string;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;
}
