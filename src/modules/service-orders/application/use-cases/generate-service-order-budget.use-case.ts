import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { FindVehicleByIdUseCase } from '@vehicle/application/use-cases/find-vehicle-by-id.use-case';
import { FindClientByIdUseCase } from '@client/application/use-cases/find-client-by-id.use-case';
import { FindServicesByIdListUseCase } from '@service/application/use-cases/find-services-by-id-list.use-case';
import { type ServiceEntity } from '@service/domain/entities/service.entity';
import { FindPartsByIdListUseCase } from '@inventory/application/use-cases/find-parts-by-id-list.use-case';
import { type Part } from '@inventory/domain/entities/part.entity';
import { PdfGenerator } from '@infra/pdf/pdf-generator';
import {
  buildServiceOrderBudgetHtml,
  type ServiceOrderBudgetLineItem,
} from '@service-orders/infrastructure/pdf/budget-html.template';

const NON_BUDGETABLE_STATUSES = new Set([
  ServiceOrderStatus.RECEIVED,
  ServiceOrderStatus.IN_DIAGNOSIS,
]);

@Injectable()
export class GenerateServiceOrderBudgetUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepository,
    private readonly findVehicleById: FindVehicleByIdUseCase,
    private readonly findClientById: FindClientByIdUseCase,
    private readonly findServicesByIdList: FindServicesByIdListUseCase,
    private readonly findPartsByIdList: FindPartsByIdListUseCase,
    private readonly pdfGenerator: PdfGenerator,
  ) {}

  async execute(id: string): Promise<Buffer> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);
    if (!serviceOrder) throw new NotFoundException('Service order not found');

    if (NON_BUDGETABLE_STATUSES.has(serviceOrder.status)) {
      throw new BadRequestException(
        'Cannot generate a budget for a service order in RECEIVED or IN_DIAGNOSIS status',
      );
    }
    if (serviceOrder.serviceItems.length === 0 && serviceOrder.partItems.length === 0) {
      throw new BadRequestException(
        'Cannot generate a budget for a service order without services or parts',
      );
    }

    const vehicle = await this.findVehicleById.execute(serviceOrder.vehicleId);
    const client = await this.findClientById.execute(vehicle.clientId);

    const [services, parts] = await Promise.all([
      serviceOrder.serviceItems.length > 0
        ? this.findServicesByIdList.execute(serviceOrder.serviceItems.map((item) => item.serviceId))
        : Promise.resolve([]),
      serviceOrder.partItems.length > 0
        ? this.findPartsByIdList.execute(serviceOrder.partItems.map((item) => item.inventoryId))
        : Promise.resolve([]),
    ]);
    const servicesById = new Map<string, ServiceEntity>(
      services.map((service) => [service.id, service]),
    );
    const partsById = new Map<string, Part>(parts.map((part) => [part.id, part]));

    const serviceLineItems: ServiceOrderBudgetLineItem[] = serviceOrder.serviceItems.map(
      (item) => {
        const service = servicesById.get(item.serviceId);
        if (!service?.name) {
          throw new NotFoundException(`Service not found: ${item.serviceId}`);
        }
        return {
          name: service.name,
          quantity: 1,
          unitOfMeasure: null,
          unitPrice: item.price,
          subtotal: item.price,
        };
      },
    );

    const partLineItems: ServiceOrderBudgetLineItem[] = serviceOrder.partItems.map((item) => {
      const part = partsById.get(item.inventoryId);
      if (!part) {
        throw new NotFoundException(`Part not found: ${item.inventoryId}`);
      }
      return {
        name: part.name,
        quantity: item.quantity,
        unitOfMeasure: item.unitOfMeasure,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      };
    });

    const html = buildServiceOrderBudgetHtml({
      serviceOrderId: serviceOrder.id,
      description: serviceOrder.description,
      status: serviceOrder.status,
      client: {
        name: client.name,
        cpfCnpj: client.cpfCnpj.value,
        phone: client.phone,
        address: client.address,
        email: client.email,
      },
      vehicle: {
        brand: vehicle.brand,
        model: vehicle.model,
        licensePlate: vehicle.licensePlate.value,
        year: vehicle.year,
      },
      services: serviceLineItems,
      parts: partLineItems,
      totalAmount: serviceOrder.totalAmount,
      generatedAt: new Date(),
    });

    return this.pdfGenerator.generate(html);
  }
}
