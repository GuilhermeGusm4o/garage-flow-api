import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { type UserRole } from '@auth/domain/entities/user.entity';
import { JwtAuthGuard } from '@auth/infrastructure/security/jwt-auth.guard';
import { Roles } from '@auth/infrastructure/security/roles.decorator';
import { RolesGuard } from '@auth/infrastructure/security/roles.guard';
import { ErrorResponseDto } from '@common/dtos/error-response.dto';

export function ApiAuth(...roles: UserRole[]) {
  const guards = roles.length > 0 ? [JwtAuthGuard, RolesGuard] : [JwtAuthGuard];

  return applyDecorators(
    ApiBearerAuth('access-token'),
    UseGuards(...guards),
    ...(roles.length > 0 ? [Roles(...roles)] : []),
    ApiUnauthorizedResponse({
      type: ErrorResponseDto,
      description: 'Missing or invalid access token',
    }),
    ...(roles.length > 0
      ? [
          ApiForbiddenResponse({
            type: ErrorResponseDto,
            description: 'Authenticated user does not have the required role',
          }),
        ]
      : []),
  );
}
