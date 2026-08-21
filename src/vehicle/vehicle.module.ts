import { Module } from '@nestjs/common';
import { ClientModule } from '../client/client.module';
import { VehicleController } from '@vehicle/presentation/vehicle.controller';
import { CreateVehicleUseCase } from '@vehicle/application/use-cases/create-vehicle.use-case';
import { FindAllVehiclesUseCase } from '@vehicle/application/use-cases/find-all-vehicles.use-case';
import { FindVehicleByIdUseCase } from '@vehicle/application/use-cases/find-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from '@vehicle/application/use-cases/update-vehicle.use-case';
import { DeleteVehicleUseCase } from '@vehicle/application/use-cases/delete-vehicle.use-case';
import { VehicleRepository } from '@vehicle/domain/repositories/vehicle.repository';
import { PrismaVehicleRepository } from '@vehicle/infrastructure/prisma-vehicle.repository';
import { PrismaService } from '../infra/database/prisma/prisma.service';

@Module({
  imports: [ClientModule],
  controllers: [VehicleController],
  providers: [
    PrismaService,
    {
      provide: VehicleRepository,
      useClass: PrismaVehicleRepository,
    },
    CreateVehicleUseCase,
    FindAllVehiclesUseCase,
    FindVehicleByIdUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
  ],
  exports: [VehicleRepository, FindVehicleByIdUseCase],
})
export class VehicleModule {}
