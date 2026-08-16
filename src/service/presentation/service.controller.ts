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
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateServiceUseCase } from '@service/application/use-cases/create-service.use-case';
import { FindAllServicesUseCase } from '@service/application/use-cases/find-all-services.use-case';
import { FindServiceByIdUseCase } from '@service/application/use-cases/find-service-by-id.use-case';
import { UpdateServiceUseCase } from '@service/application/use-cases/update-service.use-case';
import { DeleteServiceUseCase } from '@service/application/use-cases/delete-service.use-case';
import { CreateServiceRequest } from '@service/presentation/dtos/create-service.request';
import { UpdateServiceRequest } from '@service/presentation/dtos/update-service.request';
import { ServiceResponse } from '@service/presentation/dtos/service.response';

@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly findAllServicesUseCase: FindAllServicesUseCase,
    private readonly findServiceByIdUseCase: FindServiceByIdUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly deleteServiceUseCase: DeleteServiceUseCase,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: ServiceResponse })
  async create(@Body() body: CreateServiceRequest): Promise<ServiceResponse> {
    const service = await this.createServiceUseCase.execute(body.name, body.price);
    return ServiceResponse.fromEntity(service);
  }

  @Get()
  @ApiOkResponse({ type: [ServiceResponse] })
  async findAll(): Promise<ServiceResponse[]> {
    const services = await this.findAllServicesUseCase.execute();
    return services.map(ServiceResponse.fromEntity);
  }

  @Get(':id')
  @ApiOkResponse({ type: ServiceResponse })
  @ApiNotFoundResponse({ description: 'Service not found' })
  async findOne(@Param('id') id: string): Promise<ServiceResponse> {
    const service = await this.findServiceByIdUseCase.execute(id);
    return ServiceResponse.fromEntity(service);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ServiceResponse })
  @ApiNotFoundResponse({ description: 'Service not found' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateServiceRequest,
  ): Promise<ServiceResponse> {
    const service = await this.updateServiceUseCase.execute(id, body.name, body.price);
    return ServiceResponse.fromEntity(service);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Service deleted successfully' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteServiceUseCase.execute(id);
  }
}
