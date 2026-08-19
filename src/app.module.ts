import { Module } from '@nestjs/common';
import { HealthModule } from './infra/health/health.module';
import { PrismaModule } from './infra/database/prisma/prisma.module';
import { InventoryModule } from './inventory/inventory.module';
import { AuthModule } from './modules/auth/auth.module';
import { ServiceModule } from './modules/service/service.module';

@Module({
  imports: [HealthModule, PrismaModule, InventoryModule, AuthModule, ServiceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
