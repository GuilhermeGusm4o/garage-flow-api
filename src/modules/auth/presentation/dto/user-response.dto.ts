import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { User } from '../../domain/entities/user.entity';
import { UserRole } from 'generated/prisma/client';

export class UserResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name!: string;

  @ApiProperty({
    example: 'john.doe@email.com',
  })
  email!: string;

  @ApiProperty({
    example: UserRole.MECHANIC,
    enum: UserRole,
  })
  role!: UserRole;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;

  @ApiPropertyOptional({
    nullable: true,
  })
  deletedAt?: Date | null;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();

    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.role = user.role;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    dto.deletedAt = user.deletedAt;

    return dto;
  }
}
