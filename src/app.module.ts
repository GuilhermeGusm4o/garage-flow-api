import { Module } from '@nestjs/common';
import { HealthModule } from './infra/health/health.module';
import { PrismaModule } from './infra/database/prisma/prisma.module';

@Module({
  imports: [HealthModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
