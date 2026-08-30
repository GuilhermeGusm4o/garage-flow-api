import { ApiProperty } from '@nestjs/swagger';

import { User } from '@auth/domain/entities/user.entity';
import { UserResponseDto } from './user-response.dto';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token to use as a Bearer token on subsequent requests',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token!: string;

  @ApiProperty({
    description: 'The authenticated user',
    type: UserResponseDto,
  })
  user!: UserResponseDto;

  static create(access_token: string, user: User): LoginResponseDto {
    const dto = new LoginResponseDto();

    dto.access_token = access_token;
    dto.user = UserResponseDto.fromDomain(user);

    return dto;
  }
}
