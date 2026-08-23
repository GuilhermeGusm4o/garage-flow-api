import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePartDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsIn(['ML', 'G', 'KG', 'UNIT'])
  unitOfMeasure!: string;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;
}
