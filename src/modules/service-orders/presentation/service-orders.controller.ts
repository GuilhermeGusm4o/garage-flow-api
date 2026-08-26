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
  Query,
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@auth/infrastructure/security/roles.decorator';
import { JwtAuthGuard } from '@auth/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/security/roles.guard';
import { CreateServiceOrderUseCase } from '@service-orders/application/use-cases/create-service-order.use-case';
import { FindServiceOrderByIdUseCase } from '@service-orders/application/use-cases/find-service-order-by-id.use-case';
import { FindAllServiceOrdersUseCase } from '@service-orders/application/use-cases/find-all-service-orders.use-case';
import { UpdateServiceOrderUseCase } from '@service-orders/application/use-cases/update-service-order.use-case';
import { SoftDeleteServiceOrderUseCase } from '@service-orders/application/use-cases/soft-delete-service-order.use-case';
import { AddServicesAndPartsUseCase } from '@service-orders/application/use-cases/add-services-and-parts.use-case';
import { StartDiagnosisUseCase } from '@service-orders/application/use-cases/start-diagnosis.use-case';
import { FinishServiceUseCase } from '@service-orders/application/use-cases/finish-service.use-case';
import { DeliverServiceOrderUseCase } from '@service-orders/application/use-cases/deliver-service-order.use-case';
import { StartServiceUseCase } from '@service-orders/application/use-cases/start-service.use-case';
import { GenerateServiceOrderBudgetUseCase } from '@service-orders/application/use-cases/generate-service-order-budget.use-case';
import { ApproveServiceOrderBudgetUseCase } from '@service-orders/application/use-cases/approve-service-order-budget.use-case';
import { CancelServiceOrderUseCase } from '@service-orders/application/use-cases/cancel-service-order.use-case';
import { FindServiceOrderByTrackingTokenUseCase } from '@service-orders/application/use-cases/find-service-order-by-tracking-token.use-case';
import { GetServiceOrderTrackingLinkUseCase } from '@service-orders/application/use-cases/get-service-order-tracking-link.use-case';
import { buildTrackingLink } from '@service-orders/infrastructure/security/tracking-token.util';
import { CreateServiceOrderDto } from '@service-orders/presentation/dtos/create-service-order.dto';
import { UpdateServiceOrderDto } from '@service-orders/presentation/dtos/update-service-order.dto';
import { AddServicesAndPartsDto } from '@service-orders/presentation/dtos/add-services-and-parts.dto';
import { ServiceOrderResponseDto } from '@service-orders/presentation/dtos/service-order-response.dto';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
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
    private readonly softDeleteServiceOrder: SoftDeleteServiceOrderUseCase,
    private readonly addServicesAndParts: AddServicesAndPartsUseCase,
    private readonly startDiagnosis: StartDiagnosisUseCase,
    private readonly finishService: FinishServiceUseCase,
    private readonly deliverServiceOrder: DeliverServiceOrderUseCase,
    private readonly startService: StartServiceUseCase,
    private readonly generateServiceOrderBudget: GenerateServiceOrderBudgetUseCase,
    private readonly approveServiceOrderBudget: ApproveServiceOrderBudgetUseCase,
    private readonly cancelServiceOrder: CancelServiceOrderUseCase,
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

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Retrieves all service orders',
  })
  @ApiQuery({
    name: 'status',
    enum: ServiceOrderStatus,
    required: false,
    description: 'Use RECEIVED to list only orders available for diagnosis.',
  })
  @ApiQuery({
    name: 'mechanicId',
    required: false,
    description: 'Filter service orders assigned to a specific mechanic.',
  })
  @ApiOkResponse({ type: [ServiceOrderResponseDto] })
  async findAll(
    @Query('status') status?: ServiceOrderStatus,
    @Query('mechanicId') mechanicId?: string,
  ): Promise<ServiceOrderResponseDto[]> {
    const serviceOrders = await this.findAllServiceOrders.execute(status, mechanicId);
    return serviceOrders.map((serviceOrder) => ServiceOrderResponseDto.fromListItem(serviceOrder));
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Retrieves a service order by ID',
  })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async findOne(@Param('id') id: string): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.findServiceOrderById.execute(id);
    return ServiceOrderResponseDto.fromEntity(serviceOrder);
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

  @Patch(':id/budget')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Generates or retrieves the service order budget',
    description:
      'Use this PATCH to generate the budget when the service order is in FINISHED_DIAGNOSIS, which changes its status to AWAITING_APPROVAL. For any later status, the endpoint retrieves the budget without changing the status. Service orders in RECEIVED or IN_DIAGNOSIS cannot access a budget because items have not been added yet.',
  })
  @ApiOkResponse({
    type: ServiceOrderBudgetResponseDto,
    description:
      'Returns the service order budget. In FINISHED_DIAGNOSIS, it generates the budget and changes the status to AWAITING_APPROVAL. In any later status, it retrieves the budget without changing the status.',
  })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async generateBudget(@Param('id') id: string): Promise<ServiceOrderBudgetResponseDto> {
    const budget = await this.generateServiceOrderBudget.execute(id);
    return ServiceOrderBudgetResponseDto.fromViewModel(budget);
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

  @Patch(':id/start-diagnosis')
  @ApiBearerAuth('access-token')
  @Roles('MECHANIC')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Starts the diagnosis for a service order by ID',
    description:
      'The selected service order must have RECEIVED status. The mechanic ID is taken from the authenticated user.',
  })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async startServiceDiagnosis(
    @Param('id') id: string,
    @Req() request: { user: { id: string } },
  ): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.startDiagnosis.execute(id, request.user.id);
    return ServiceOrderResponseDto.fromEntity(serviceOrder);
  }

  @Patch(':id/add-services-and-parts')
  @ApiBearerAuth('access-token')
  @Roles('MECHANIC')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Adds services and parts to a service order and finishes the diagnosis by ID',
    description:
      'The service order must have IN_DIAGNOSIS status and be assigned to the authenticated mechanic.',
  })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async addServicesAndPartsToServiceOrder(
    @Param('id') id: string,
    @Body() dto: AddServicesAndPartsDto,
    @Req() request: { user: { id: string } },
  ): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.addServicesAndParts.execute(id, dto, request.user.id);
    return ServiceOrderResponseDto.fromEntity(serviceOrder);
  }

  @Patch(':id/approve-budget')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Approves the budget for a service order' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async approveBudget(@Param('id') id: string): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.approveServiceOrderBudget.execute(id);
    return ServiceOrderResponseDto.fromEntity(serviceOrder);
  }

  @Patch(':id/cancel-service')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Cancels a service order',
    description: 'The service order can be canceled in any status except FINISHED or DELIVERED.',
  })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async cancelService(@Param('id') id: string): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.cancelServiceOrder.execute(id);
    return ServiceOrderResponseDto.fromEntity(serviceOrder);
  }

  @Patch(':id/start-service')
  @ApiBearerAuth('access-token')
  @Roles('MECHANIC')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Starts service execution by ID',
    description:
      'The service order must be AWAITING_EXECUTION and assigned to the authenticated mechanic.',
  })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async startServiceExecution(
    @Param('id') id: string,
    @Req() request: { user: { id: string } },
  ): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.startService.execute(id, request.user.id);
    return ServiceOrderResponseDto.fromEntity(serviceOrder);
  }

  @Patch(':id/finish-service')
  @ApiBearerAuth('access-token')
  @Roles('MECHANIC')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Finishes service execution by ID',
    description:
      'The service order must be IN EXECUTION and assigned to the authenticated mechanic.',
  })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async finishServiceExecution(
    @Param('id') id: string,
    @Req() request: { user: { id: string } },
  ): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.finishService.execute(id, request.user.id);
    return ServiceOrderResponseDto.fromEntity(serviceOrder);
  }

  @Patch(':id/deliver')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Delivers a service order by ID',
    description: 'The service order must have FINISHED status.',
  })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  @ApiNotFoundResponse({ description: 'Service order not found' })
  async deliver(@Param('id') id: string): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.deliverServiceOrder.execute(id);
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
