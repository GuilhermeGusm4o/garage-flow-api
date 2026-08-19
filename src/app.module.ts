import { Module } from '@nestjs/common';
import { HealthModule } from './infra/health/health.module';
import { PrismaModule } from './infra/database/prisma/prisma.module';
import { ClientModule } from './client/client.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { ServiceModule } from './modules/service/service.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [HealthModule, PrismaModule, AuthModule, ServiceModule, ClientModule, VehicleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
