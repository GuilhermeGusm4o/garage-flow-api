import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateServiceRequest {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsPositive()
  price!: number;
}
