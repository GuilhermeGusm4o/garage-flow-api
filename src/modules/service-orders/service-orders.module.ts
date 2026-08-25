import { Module } from '@nestjs/common';
import { ServiceOrdersController } from '@service-orders/presentation/service-orders.controller';
import { CreateServiceOrderUseCase } from '@service-orders/application/use-cases/create-service-order.use-case';
import { FindServiceOrderByIdUseCase } from '@service-orders/application/use-cases/find-service-order-by-id.use-case';
import { FindAllServiceOrdersUseCase } from '@service-orders/application/use-cases/find-all-service-orders.use-case';
import { UpdateServiceOrderUseCase } from '@service-orders/application/use-cases/update-service-order.use-case';
import { UpdateServiceOrderStatusUseCase } from '@service-orders/application/use-cases/update-service-order-status.use-case';
import { SoftDeleteServiceOrderUseCase } from '@service-orders/application/use-cases/soft-delete-service-order.use-case';
import { CalculateTotalAmountUseCase } from '@service-orders/application/use-cases/calculate-total-amount.use-case';
import { AddServicesAndPartsUseCase } from '@service-orders/application/use-cases/add-services-and-parts.use-case';
import { GenerateServiceOrderBudgetUseCase } from '@service-orders/application/use-cases/generate-service-order-budget.use-case';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { PrismaServiceOrderRepository } from '@service-orders/infrastructure/prisma-service-order.repository';
import { ClientModule } from '@client/client.module';
import { VehicleModule } from '@vehicle/vehicle.module';
import { ServiceModule } from '@service/service.module';
import { InventoryModule } from '@inventory/inventory.module';

@Module({
  imports: [ClientModule, VehicleModule, ServiceModule, InventoryModule],
  controllers: [ServiceOrdersController],
  providers: [
    CreateServiceOrderUseCase,
    FindServiceOrderByIdUseCase,
    FindAllServiceOrdersUseCase,
    UpdateServiceOrderUseCase,
    UpdateServiceOrderStatusUseCase,
    SoftDeleteServiceOrderUseCase,
    CalculateTotalAmountUseCase,
    AddServicesAndPartsUseCase,
    GenerateServiceOrderBudgetUseCase,
    { provide: ServiceOrderRepository, useClass: PrismaServiceOrderRepository },
  ],
})
export class ServiceOrdersModule {}
