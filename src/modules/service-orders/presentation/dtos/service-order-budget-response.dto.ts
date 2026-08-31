import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  type ServiceOrderBudget,
  type ServiceOrderBudgetLineItem,
} from '@service-orders/application/use-cases/generate-service-order-budget.use-case';

export class ServiceOrderBudgetLineItemResponseDto {
  @ApiProperty({ description: 'Service or part name', example: 'Troca de óleo' })
  name!: string;

  @ApiProperty({ description: 'Quantity billed', example: 1 })
  quantity!: number;

  @ApiPropertyOptional({
    description: 'Unit of measure, null for services',
    example: 'UNIT',
    nullable: true,
  })
  unitOfMeasure!: string | null;

  @ApiProperty({ description: 'Unit price', example: 150.0 })
  unitPrice!: number;

  @ApiProperty({ description: 'quantity * unitPrice', example: 150.0 })
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
  @ApiProperty({ description: "Client's name", example: 'João da Silva' })
  name!: string;

  @ApiProperty({ description: "Client's formatted CPF or CNPJ", example: '529.982.247-25' })
  cpfCnpj!: string;

  @ApiProperty({ description: "Client's phone number", example: '11999998888' })
  phone!: string;

  @ApiProperty({ description: 'Address', example: 'Rua das Flores, 123 - São Paulo/SP' })
  address!: string;

  @ApiPropertyOptional({
    description: "Client's email",
    example: 'joao@email.com',
    nullable: true,
  })
  email!: string | null;
}

export class ServiceOrderBudgetVehicleResponseDto {
  @ApiProperty({ description: "Vehicle's brand", example: 'Volkswagen' })
  brand!: string;

  @ApiProperty({ description: "Vehicle's model", example: 'Gol' })
  model!: string;

  @ApiProperty({ description: "Vehicle's formatted license plate", example: 'ABC1D23' })
  licensePlate!: string;

  @ApiProperty({ description: "Vehicle's model year", example: 2020 })
  year!: number;
}

export class ServiceOrderBudgetResponseDto {
  @ApiProperty({
    description: 'Service order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  serviceOrderId!: string;

  @ApiProperty({ description: 'Client complaint reported when the service order was opened' })
  description!: string;

  @ApiProperty({ description: 'Current status', example: 'AWAITING_APPROVAL' })
  status!: string;

  @ApiProperty({
    description: 'The client this budget is for',
    type: ServiceOrderBudgetClientResponseDto,
  })
  client!: ServiceOrderBudgetClientResponseDto;

  @ApiProperty({
    description: 'The vehicle this budget is for',
    type: ServiceOrderBudgetVehicleResponseDto,
  })
  vehicle!: ServiceOrderBudgetVehicleResponseDto;

  @ApiProperty({
    description: 'Services billed in this budget',
    type: [ServiceOrderBudgetLineItemResponseDto],
  })
  services!: ServiceOrderBudgetLineItemResponseDto[];

  @ApiProperty({
    description: 'Parts billed in this budget',
    type: [ServiceOrderBudgetLineItemResponseDto],
  })
  parts!: ServiceOrderBudgetLineItemResponseDto[];

  @ApiProperty({ description: 'Sum of all services and parts subtotals', example: 410.0 })
  totalAmount!: number;

  @ApiProperty({ description: 'When this budget was generated' })
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
