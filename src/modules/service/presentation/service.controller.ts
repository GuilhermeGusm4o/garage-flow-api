import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
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
import { ApiAuth } from '@common/decorators/api-auth.decorator';
import { ErrorResponseDto } from '@common/dtos/error-response.dto';

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
  @ApiAuth('ADMIN')
  @ApiOperation({
    summary: 'Creates a new service',
  })
  @ApiCreatedResponse({ type: ServiceResponse })
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: 'Invalid or negative price' })
  async create(@Body() body: CreateServiceRequest): Promise<ServiceResponse> {
    const service = await this.createServiceUseCase.execute(body.name, body.price);
    return ServiceResponse.fromEntity(service);
  }

  @Get()
  @ApiAuth()
  @ApiOperation({
    summary: 'List all services',
  })
  @ApiOkResponse({ type: [ServiceResponse] })
  async findAll(): Promise<ServiceResponse[]> {
    const services = await this.findAllServicesUseCase.execute();
    return services.map(ServiceResponse.fromEntity);
  }

  @Get(':id')
  @ApiAuth()
  @ApiOperation({
    summary: 'Fetch a service by ID',
  })
  @ApiOkResponse({ type: ServiceResponse })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'Service not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ServiceResponse> {
    const service = await this.findServiceByIdUseCase.execute(id);
    return ServiceResponse.fromEntity(service);
  }

  @Patch(':id')
  @ApiAuth('ADMIN')
  @ApiOperation({
    summary: 'Updates a service by ID',
  })
  @ApiOkResponse({ type: ServiceResponse })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'Service not found' })
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: 'Invalid or negative price' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateServiceRequest,
  ): Promise<ServiceResponse> {
    const service = await this.updateServiceUseCase.execute(id, body.name, body.price);
    return ServiceResponse.fromEntity(service);
  }

  @Delete(':id')
  @ApiAuth('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletes a service by ID',
  })
  @ApiNoContentResponse({ description: 'Service deleted successfully' })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'Service not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteServiceUseCase.execute(id);
  }
}
