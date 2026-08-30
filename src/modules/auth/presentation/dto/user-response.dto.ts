import { ApiProperty } from '@nestjs/swagger';

import { User } from '@auth/domain/entities/user.entity';
import { UserRole } from '@generated/prisma/client';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: "User's full name",
    example: 'John Doe',
  })
  name!: string;

  @ApiProperty({
    description: "User's email address",
    example: 'admin@example.com',
  })
  email!: string;

  @ApiProperty({
    description: "User's role",
    example: UserRole.MECHANIC,
    enum: UserRole,
  })
  role!: UserRole;

  @ApiProperty({ description: 'Record creation timestamp' })
  createdAt?: Date;

  @ApiProperty({ description: 'Record last-update timestamp' })
  updatedAt?: Date;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();

    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.role = user.role;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;

    return dto;
  }
}
