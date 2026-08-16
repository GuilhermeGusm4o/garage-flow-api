import { ApiProperty } from '@nestjs/swagger';

import { User } from '../../domain/entities/user.entity';
import { UserResponseDto } from './user-response.dto';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token!: string;

  @ApiProperty({
    type: UserResponseDto,
  })
  user!: UserResponseDto;

  static create(
    access_token: string,
    user: User,
  ): LoginResponseDto {
    const dto = new LoginResponseDto();

    dto.access_token = access_token;
    dto.user = UserResponseDto.fromDomain(user);

    return dto;
  }
}