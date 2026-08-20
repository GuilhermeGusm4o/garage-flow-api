import { IsNumber, Min } from 'class-validator';

export class RestockPartDto {
  @IsNumber()
  @Min(0.01)
  quantity!: number;
}
