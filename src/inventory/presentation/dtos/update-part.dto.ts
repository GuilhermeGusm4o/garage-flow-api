import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class UpdatePartDto {
  @ApiProperty({ example: 'Óleo sintético 5W40' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 59.9 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}
