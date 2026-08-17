import { Module } from '@nestjs/common';
import { ClientController } from '@client/presentation/client.controller';
import { CreateClientUseCase } from '@client/application/use-cases/create-client.use-case';
import { ClientRepository } from '@client/domain/repositories/client.repository';
import { PrismaClientRepository } from '@client/infrastructure/prisma-client.repository';
import { PrismaService } from '../infra/database/prisma/prisma.service';

@Module({
  controllers: [ClientController],
  providers: [
    PrismaService,
    {
      provide: ClientRepository,
      useClass: PrismaClientRepository,
    },
    CreateClientUseCase,
  ],
})
export class ClientModule {}
