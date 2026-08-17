import { Module } from '@nestjs/common';
import { HealthModule } from './infra/health/health.module';
import { PrismaModule } from './infra/database/prisma/prisma.module';
import { ClientModule } from './client/client.module';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [HealthModule, PrismaModule, ClientModule, VehicleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
