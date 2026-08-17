import { Module } from '@nestjs/common';
import { HealthModule } from './infra/health/health.module';
import { PrismaModule } from './infra/database/prisma/prisma.module';
import { ServiceModule } from './modules/service/service.module';
import { AuthModule } from './modules/auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';
import { ClientModule } from '@client/client.module';


@Module({
  imports: [HealthModule, PrismaModule, AuthModule, ServiceModule, InventoryModule, ClientModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
