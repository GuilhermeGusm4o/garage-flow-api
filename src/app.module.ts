import { Module } from '@nestjs/common';
import { HealthModule } from './infra/health/health.module';
import { PrismaModule } from './infra/database/prisma/prisma.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ClientModule } from './modules/client/client.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { ServiceModule } from './modules/service/service.module';
import { AuthModule } from './modules/auth/auth.module';
import { ServiceOrdersModule } from './modules/service-orders/service-orders.module';

@Module({
  imports: [
    HealthModule,
    PrismaModule,
    AuthModule,
    ServiceModule,
    InventoryModule,
    ClientModule,
    VehicleModule,
    InventoryModule,
    ServiceOrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
