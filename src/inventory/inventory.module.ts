import { Module } from '@nestjs/common';
import { InventoryController } from './presentation/inventory.controller';
import { CreatePartUseCase } from './application/use-cases/create-part.use-case';
import { RestockPartUseCase } from './application/use-cases/restock-part.use-case';
import { ConsumePartUseCase } from './application/use-cases/consume-part.use-case';
import { ListPartsUseCase } from './application/use-cases/list-parts.use-case';
import { CalculateAvailabilityUseCase } from './application/use-cases/calculate-availability.use-case';
import { PartRepository } from './domain/repositories/part.repository';
import { PrismaPartRepository } from './infrastructure/prisma-part.repository';

@Module({
  controllers: [InventoryController],
  providers: [
    CreatePartUseCase,
    RestockPartUseCase,
    ConsumePartUseCase,
    ListPartsUseCase,
    CalculateAvailabilityUseCase,
    { provide: PartRepository, useClass: PrismaPartRepository },
  ],
  exports: [CalculateAvailabilityUseCase, ConsumePartUseCase],
})
export class InventoryModule {}