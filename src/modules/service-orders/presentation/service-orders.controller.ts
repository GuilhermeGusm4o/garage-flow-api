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
import { UpdateServiceOrderStatusUseCase } from '@service-orders/application/use-cases/update-service-order-status.use-case';
import { SoftDeleteServiceOrderUseCase } from '@service-orders/application/use-cases/soft-delete-service-order.use-case';
import { AddServicesAndPartsUseCase } from '@service-orders/application/use-cases/add-services-and-parts.use-case';
import { StartDiagnosisUseCase } from '@service-orders/application/use-cases/start-diagnosis.use-case';
import { CreateServiceOrderDto } from '@service-orders/presentation/dtos/create-service-order.dto';
import { UpdateServiceOrderDto } from '@service-orders/presentation/dtos/update-service-order.dto';
import { UpdateServiceOrderStatusDto } from '@service-orders/presentation/dtos/update-service-order-status.dto';
import { AddServicesAndPartsDto } from '@service-orders/presentation/dtos/add-services-and-parts.dto';
import { ServiceOrderResponseDto } from '@service-orders/presentation/dtos/service-order-response.dto';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

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
    private readonly startDiagnosis: StartDiagnosisUseCase,
  ) {}

  @Post()
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Creates a new service order',
  })
  @ApiCreatedResponse({ type: ServiceOrderResponseDto })
  async create(@Body() dto: CreateServiceOrderDto): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.createServiceOrder.execute(dto);
    return ServiceOrderResponseDto.fromEntity(serviceOrder);
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
  @ApiOkResponse({ type: [ServiceOrderResponseDto] })
  async findAll(@Query('status') status?: ServiceOrderStatus): Promise<ServiceOrderResponseDto[]> {
    const serviceOrders = await this.findAllServiceOrders.execute(status);
    return serviceOrders.map(ServiceOrderResponseDto.fromListItem);
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
}
