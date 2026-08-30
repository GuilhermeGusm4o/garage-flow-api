import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { type StringValue } from 'ms';

import { PrismaModule } from '@infra/database/prisma/prisma.module';

import { UserRepository } from './domain/repositories/user.repository';

import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { LoginUseCase } from './application/use-cases/login-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { GetUserByEmailUseCase } from './application/use-cases/get-user-by-email.use-case';

import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';

import { AuthController } from './presentation/auth.controller';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/security/jwt-auth.guard';
import { RolesGuard } from './infrastructure/security/roles.guard';

const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? '1h') as StringValue;

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
  ],

  controllers: [AuthController],

  providers: [
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },

    BcryptPasswordHasher,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,

    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    LoginUseCase,
    ListUsersUseCase,
    GetUserByEmailUseCase,
  ],

  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
