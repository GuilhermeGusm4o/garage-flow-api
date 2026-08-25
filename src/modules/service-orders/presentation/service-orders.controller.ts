import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { type Request } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@auth/infrastructure/security/roles.decorator';
import { JwtAuthGuard } from '@auth/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/security/roles.guard';
import { CreateServiceOrderUseCase } from '@service-orders/application/use-cases/create-service-order.use-case';
import { FindServiceOrderByIdUseCase } from '@service-orders/application/use-cases/find-service-order-by-id.use-case';
import { FindAllServiceOrdersUseCase } from '@service-orders/application/use-cases/find-all-service-orders.use-case';
import { UpdateServiceOrderUseCase } from '@service-orders/application/use-cases/update-service-order.use-case';
import { UpdateServiceOrderStatusUseCase } from '@service-orders/application/use-cases/update-service-order-status.use-case';
import { SoftDeleteServiceOrderUseCase } from '@service-orders/application/use-cases/soft-delete-service-order.use-case';
import { AddServicesAndPartsUseCase } from '@service-orders/application/use-cases/add-services-and-parts.use-case';
import { GenerateServiceOrderBudgetUseCase } from '@service-orders/application/use-cases/generate-service-order-budget.use-case';
import { FindServiceOrderByTrackingTokenUseCase } from '@service-orders/application/use-cases/find-service-order-by-tracking-token.use-case';
import { GetServiceOrderTrackingLinkUseCase } from '@service-orders/application/use-cases/get-service-order-tracking-link.use-case';
import { buildTrackingLink } from '@service-orders/infrastructure/security/tracking-token.util';
import { CreateServiceOrderDto } from '@service-orders/presentation/dtos/create-service-order.dto';
import { UpdateServiceOrderDto } from '@service-orders/presentation/dtos/update-service-order.dto';
import { UpdateServiceOrderStatusDto } from '@service-orders/presentation/dtos/update-service-order-status.dto';
import { AddServicesAndPartsDto } from '@service-orders/presentation/dtos/add-services-and-parts.dto';
import { ServiceOrderResponseDto } from '@service-orders/presentation/dtos/service-order-response.dto';
import { ServiceOrderBudgetResponseDto } from '@service-orders/presentation/dtos/service-order-budget-response.dto';
import { ServiceOrderCreatedResponseDto } from '@service-orders/presentation/dtos/service-order-created-response.dto';
import { ServiceOrderTrackingResponseDto } from '@service-orders/presentation/dtos/service-order-tracking-response.dto';
import { ServiceOrderTrackingLinkResponseDto } from '@service-orders/presentation/dtos/service-order-tracking-link-response.dto';

@ApiTags('Service Orders')
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(
    private readonly createServiceOrder: CreateServiceOrderUseCase,
    private readonly findServiceOrderById: FindServiceOrderByIdUseCase,
    private readonly findAllServiceOrders: FindAllServiceOrdersUseCase,
    private readonly updateServiceOrder: UpdateServiceOrderUseCase,
    private readonly updateServiceOrderStatus: UpdateServiceOrderStatusUseCase,
    private readonly softDeleteServiceOrder: SoftDeleteServiceOrderUseCase,
    private readonly addServicesAndParts: AddServicesAndPartsUseCase,
    private readonly generateServiceOrderBudget: GenerateServiceOrderBudgetUseCase,
    private readonly findServiceOrderByTrackingToken: FindServiceOrderByTrackingTokenUseCase,
    private readonly getServiceOrderTrackingLink: GetServiceOrderTrackingLinkUseCase,
  ) {}

  @Post()
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Creates a new service order',
  })
  @ApiCreatedResponse({ type: ServiceOrderCreatedResponseDto })
  async create(
    @Body() dto: CreateServiceOrderDto,
    @Req() request: Request,
  ): Promise<ServiceOrderCreatedResponseDto> {
    const serviceOrder = await this.createServiceOrder.execute(dto);
    const trackingLink = buildTrackingLink(this.getBaseUrl(request), serviceOrder.id);
    return ServiceOrderCreatedResponseDto.fromEntityWithLink(serviceOrder, trackingLink);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Retrieves all service orders',
  })
  @ApiOkResponse({ type: [ServiceOrderResponseDto] })
  async findAll(): Promise<ServiceOrderResponseDto[]> {
    const serviceOrders = await this.findAllServiceOrders.execute();
    return serviceOrders.map(ServiceOrderResponseDto.fromEntity);
  }

  @Get('track/:token')
  @ApiOperation({
    summary: 'Publicly retrieves the current status and last update date of a service order',
  })
  @ApiOkResponse({ type: ServiceOrderTrackingResponseDto })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async trackByToken(@Param('token') token: string): Promise<ServiceOrderTrackingResponseDto> {
    const serviceOrder = await this.findServiceOrderByTrackingToken.execute(token);
    return ServiceOrderTrackingResponseDto.fromEntity(serviceOrder);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Retrieves a service order by ID',
  })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async findOne(@Param('id') id: string): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.findServiceOrderById.execute(id);
    return ServiceOrderResponseDto.fromEntity(serviceOrder);
  }

  @Get(':id/budget')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Generates and returns the budget data for a service order',
  })
  @ApiOkResponse({ type: ServiceOrderBudgetResponseDto })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async generateBudget(@Param('id') id: string): Promise<ServiceOrderBudgetResponseDto> {
    const budget = await this.generateServiceOrderBudget.execute(id);
    return ServiceOrderBudgetResponseDto.fromViewModel(budget);
  }

  @Get(':id/tracking-link')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Retrieves the public tracking link to share with the client',
  })
  @ApiOkResponse({ type: ServiceOrderTrackingLinkResponseDto })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async getTrackingLink(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<ServiceOrderTrackingLinkResponseDto> {
    const trackingLink = await this.getServiceOrderTrackingLink.execute(
      this.getBaseUrl(request),
      id,
    );
    return new ServiceOrderTrackingLinkResponseDto(trackingLink);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Updates a service order by ID',
  })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceOrderDto,
  ): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.updateServiceOrder.execute(id, dto);
    return ServiceOrderResponseDto.fromEntity(serviceOrder);
  }

  @Patch(':id/status')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'MECHANIC', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Updates the status of a service order by ID',
  })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateServiceOrderStatusDto,
  ): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.updateServiceOrderStatus.execute(id, dto);
    return ServiceOrderResponseDto.fromEntity(serviceOrder);
  }

  @Patch(':id/services-and-parts')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'MECHANIC')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Adds services and parts to a service order',
  })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async addServicesAndPartsToServiceOrder(
    @Param('id') id: string,
    @Body() dto: AddServicesAndPartsDto,
  ): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.addServicesAndParts.execute(id, dto);
    return ServiceOrderResponseDto.fromEntity(serviceOrder);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Soft deletes a service order by ID',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Service order deleted successfully' })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.softDeleteServiceOrder.execute(id);
  }

  private getBaseUrl(request: Request): string {
    return `${request.protocol}://${request.get('host')}`;
  }
}
