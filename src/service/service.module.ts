import { Module } from '@nestjs/common';
import { ServiceController } from '@service/presentation/service.controller';
import { CreateServiceUseCase } from '@service/application/use-cases/create-service.use-case';
import { FindAllServicesUseCase } from '@service/application/use-cases/find-all-services.use-case';
import { FindServiceByIdUseCase } from '@service/application/use-cases/find-service-by-id.use-case';
import { UpdateServiceUseCase } from '@service/application/use-cases/update-service.use-case';
import { DeleteServiceUseCase } from '@service/application/use-cases/delete-service.use-case';
import { ServiceRepository } from '@service/domain/repositories/service.repository';
import { PrismaServiceRepository } from '@service/infrastructure/prisma-service.repository';
import { PrismaService } from '../infra/database/prisma/prisma.service';

@Module({
  controllers: [ServiceController],
  providers: [
    PrismaService,
    {
      provide: ServiceRepository,
      useClass: PrismaServiceRepository,
    },
    CreateServiceUseCase,
    FindAllServicesUseCase,
    FindServiceByIdUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
  ],
})
export class ServiceModule {}
