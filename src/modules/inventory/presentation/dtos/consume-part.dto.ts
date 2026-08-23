import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class ConsumePartDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0.01)
  quantity!: number;
}
