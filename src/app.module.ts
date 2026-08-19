import { Module } from '@nestjs/common';
import { HealthModule } from './infra/health/health.module';
import { PrismaModule } from './infra/database/prisma/prisma.module';
import { InventoryModule } from './inventory/inventory.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [HealthModule, PrismaModule, InventoryModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
