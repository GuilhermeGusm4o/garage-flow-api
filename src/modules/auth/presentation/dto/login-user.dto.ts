import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@email.com',
    maxLength: 254,
    description: 'The user email address. Must be a valid email format.',
  })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({
    example: 'StrongPassword123',
    minLength: 8,
    maxLength: 128,
    description: 'Password used to authenticate. Minimum 8 characters and maximum 128.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
