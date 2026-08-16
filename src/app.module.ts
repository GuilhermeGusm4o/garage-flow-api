import { Module } from '@nestjs/common';
import { HealthModule } from './infra/health/health.module';
import { PrismaModule } from './infra/database/prisma/prisma.module';
import { ServiceModule } from './service/service.module';

@Module({
  imports: [HealthModule, PrismaModule, ServiceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
