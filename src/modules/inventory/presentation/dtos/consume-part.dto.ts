import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class ConsumePartDto {
  @ApiProperty({ description: 'Quantity to subtract from the current stock', example: 5 })
  @IsNumber()
  @Min(0.01)
  quantity!: number;
}
