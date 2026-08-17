import { Module } from '@nestjs/common';
import { HealthModule } from './infra/health/health.module';
import { PrismaModule } from './infra/database/prisma/prisma.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [HealthModule, PrismaModule, InventoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
