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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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
import { CreateServiceOrderDto } from '@service-orders/presentation/dtos/create-service-order.dto';
import { UpdateServiceOrderDto } from '@service-orders/presentation/dtos/update-service-order.dto';
import { UpdateServiceOrderStatusDto } from '@service-orders/presentation/dtos/update-service-order-status.dto';
import { AddServicesAndPartsDto } from '@service-orders/presentation/dtos/add-services-and-parts.dto';

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
  ) {}

  @Post()
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Creates a new service order',
  })
  create(@Body() dto: CreateServiceOrderDto) {
    return this.createServiceOrder.execute(dto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Retrieves all service orders',
  })
  findAll() {
    return this.findAllServiceOrders.execute();
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Retrieves a service order by ID',
  })
  findOne(@Param('id') id: string) {
    return this.findServiceOrderById.execute(id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Updates a service order by ID',
  })
  update(@Param('id') id: string, @Body() dto: UpdateServiceOrderDto) {
    return this.updateServiceOrder.execute(id, dto);
  }

  @Patch(':id/status')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'MECHANIC', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Updates the status of a service order by ID',
  })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateServiceOrderStatusDto) {
    return this.updateServiceOrderStatus.execute(id, dto);
  }

  @Patch(':id/services-and-parts')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'MECHANIC')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Adds services and parts to a service order',
  })
  addServicesAndPartsToServiceOrder(@Param('id') id: string, @Body() dto: AddServicesAndPartsDto) {
    return this.addServicesAndParts.execute(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Soft deletes a service order by ID',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.softDeleteServiceOrder.execute(id);
  }
}
