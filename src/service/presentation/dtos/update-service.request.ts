import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateServiceRequest {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;
}
