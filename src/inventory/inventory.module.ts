import { Module } from '@nestjs/common';
import { InventoryController } from '@inventory/presentation/inventory.controller';
import { CreatePartUseCase } from '@inventory/application/use-cases/create-part.use-case';
import { RestockPartUseCase } from '@inventory/application/use-cases/restock-part.use-case';
import { ConsumePartUseCase } from '@inventory/application/use-cases/consume-part.use-case';
import { ListPartsUseCase } from '@inventory/application/use-cases/list-parts.use-case';
import { UpdatePartUseCase } from '@inventory/application/use-cases/update-part.use-case';
import { SoftDeletePartUseCase } from '@inventory/application/use-cases/soft-delete-part.use-case';
import { CalculateAvailabilityUseCase } from '@inventory/application/use-cases/calculate-availability.use-case';
import { PartRepository } from '@inventory/domain/repositories/part.repository';
import { PrismaPartRepository } from '@inventory/infrastructure/prisma-part.repository';

@Module({
  controllers: [InventoryController],
  providers: [
    CreatePartUseCase,
    RestockPartUseCase,
    ConsumePartUseCase,
    ListPartsUseCase,
    UpdatePartUseCase,
    SoftDeletePartUseCase,
    CalculateAvailabilityUseCase,
    { provide: PartRepository, useClass: PrismaPartRepository },
  ],
  exports: [CalculateAvailabilityUseCase, ConsumePartUseCase],
})
export class InventoryModule {}
