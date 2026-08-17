import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '@generated/prisma/enums';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
    description: 'Full user name. Minimum 2 and maximum 100 characters.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'john.doe@email.com',
    maxLength: 254,
    description: 'User email address. Must be a valid email format.',
  })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({
    example: 'StrongPassword123',
    minLength: 8,
    maxLength: 128,
    description:
      'Password rules: minimum 8 characters, maximum 128, must contain at least one letter and one number.',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password must contain at least one letter and one number',
  })
  password!: string;

  @ApiProperty({
    example: UserRole.MECHANIC,
    enum: UserRole,
    description: 'User role in the system.',
  })
  @IsEnum(UserRole)
  role!: UserRole;
}
