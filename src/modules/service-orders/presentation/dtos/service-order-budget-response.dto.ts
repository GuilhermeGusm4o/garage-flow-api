import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  type ServiceOrderBudget,
  type ServiceOrderBudgetLineItem,
} from '@service-orders/application/use-cases/generate-service-order-budget.use-case';

export class ServiceOrderBudgetLineItemResponseDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  quantity!: number;

  @ApiPropertyOptional({ nullable: true })
  unitOfMeasure!: string | null;

  @ApiProperty()
  unitPrice!: number;

  @ApiProperty()
  subtotal!: number;

  static fromViewModel(item: ServiceOrderBudgetLineItem): ServiceOrderBudgetLineItemResponseDto {
    const response = new ServiceOrderBudgetLineItemResponseDto();
    response.name = item.name;
    response.quantity = item.quantity;
    response.unitOfMeasure = item.unitOfMeasure;
    response.unitPrice = item.unitPrice;
    response.subtotal = item.subtotal;
    return response;
  }
}

export class ServiceOrderBudgetClientResponseDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  cpfCnpj!: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty()
  address!: string;

  @ApiPropertyOptional({ nullable: true })
  email!: string | null;
}

export class ServiceOrderBudgetVehicleResponseDto {
  @ApiProperty()
  brand!: string;

  @ApiProperty()
  model!: string;

  @ApiProperty()
  licensePlate!: string;

  @ApiProperty()
  year!: number;
}

export class ServiceOrderBudgetResponseDto {
  @ApiProperty()
  serviceOrderId!: string;

  @ApiProperty({ description: 'Reclamação do cliente relatada na abertura da OS' })
  description!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ type: ServiceOrderBudgetClientResponseDto })
  client!: ServiceOrderBudgetClientResponseDto;

  @ApiProperty({ type: ServiceOrderBudgetVehicleResponseDto })
  vehicle!: ServiceOrderBudgetVehicleResponseDto;

  @ApiProperty({ type: [ServiceOrderBudgetLineItemResponseDto] })
  services!: ServiceOrderBudgetLineItemResponseDto[];

  @ApiProperty({ type: [ServiceOrderBudgetLineItemResponseDto] })
  parts!: ServiceOrderBudgetLineItemResponseDto[];

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  generatedAt!: Date;

  static fromViewModel(budget: ServiceOrderBudget): ServiceOrderBudgetResponseDto {
    const response = new ServiceOrderBudgetResponseDto();
    response.serviceOrderId = budget.serviceOrderId;
    response.description = budget.description;
    response.status = budget.status;
    response.client = budget.client;
    response.vehicle = budget.vehicle;
    response.services = budget.services.map(ServiceOrderBudgetLineItemResponseDto.fromViewModel);
    response.parts = budget.parts.map(ServiceOrderBudgetLineItemResponseDto.fromViewModel);
    response.totalAmount = budget.totalAmount;
    response.generatedAt = budget.generatedAt;
    return response;
  }
}
