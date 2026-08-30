import { type JwtService } from '@nestjs/jwt';
import { type UserRole } from '@auth/domain/entities/user.entity';

export function signAuthToken(jwtService: JwtService, sub: string, role: UserRole): string {
  return `Bearer ${jwtService.sign({ sub, role })}`;
}
