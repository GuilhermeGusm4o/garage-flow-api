import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class RestockPartDto {
  @ApiProperty({ description: 'Quantity to add to the current stock', example: 10 })
  @IsNumber()
  @Min(0.01)
  quantity!: number;
}
