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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateServiceOrderUseCase } from '@service-orders/application/use-cases/create-service-order.use-case';
import { FindServiceOrderByIdUseCase } from '@service-orders/application/use-cases/find-service-order-by-id.use-case';
import { FindAllServiceOrdersUseCase } from '@service-orders/application/use-cases/find-all-service-orders.use-case';
import { UpdateServiceOrderUseCase } from '@service-orders/application/use-cases/update-service-order.use-case';
import { SoftDeleteServiceOrderUseCase } from '@service-orders/application/use-cases/soft-delete-service-order.use-case';
import { CreateServiceOrderDto } from '@service-orders/presentation/dtos/create-service-order.dto';
import { UpdateServiceOrderDto } from '@service-orders/presentation/dtos/update-service-order.dto';

@ApiTags('service-orders')
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(
    private readonly createServiceOrder: CreateServiceOrderUseCase,
    private readonly findServiceOrderById: FindServiceOrderByIdUseCase,
    private readonly findAllServiceOrders: FindAllServiceOrdersUseCase,
    private readonly updateServiceOrder: UpdateServiceOrderUseCase,
    private readonly softDeleteServiceOrder: SoftDeleteServiceOrderUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateServiceOrderDto) {
    return this.createServiceOrder.execute(dto);
  }

  @Get()
  findAll() {
    return this.findAllServiceOrders.execute();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findServiceOrderById.execute(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceOrderDto) {
    return this.updateServiceOrder.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.softDeleteServiceOrder.execute(id);
  }
}
