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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateVehicleUseCase } from '@vehicle/application/use-cases/create-vehicle.use-case';
import { FindAllVehiclesUseCase } from '@vehicle/application/use-cases/find-all-vehicles.use-case';
import { FindVehicleByIdUseCase } from '@vehicle/application/use-cases/find-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from '@vehicle/application/use-cases/update-vehicle.use-case';
import { DeleteVehicleUseCase } from '@vehicle/application/use-cases/delete-vehicle.use-case';
import { CreateVehicleRequest } from '@vehicle/presentation/dtos/create-vehicle.request';
import { UpdateVehicleRequest } from '@vehicle/presentation/dtos/update-vehicle.request';
import { VehicleResponse } from '@vehicle/presentation/dtos/vehicle.response';
import { ApiAuth } from '@common/decorators/api-auth.decorator';
import { ErrorResponseDto } from '@common/dtos/error-response.dto';

@ApiTags('Vehicles')
@Controller('vehicles')
export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly findAllVehiclesUseCase: FindAllVehiclesUseCase,
    private readonly findVehicleByIdUseCase: FindVehicleByIdUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
  ) {}

  @Post()
  @ApiAuth('ADMIN', 'SERVICE_ADVISOR')
  @ApiOperation({
    summary: 'Creates a new vehicle',
  })
  @ApiCreatedResponse({ type: VehicleResponse })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid license plate or payload',
  })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'Client not found' })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'Vehicle with this license plate already exists',
  })
  async create(@Body() body: CreateVehicleRequest): Promise<VehicleResponse> {
    const vehicle = await this.createVehicleUseCase.execute({
      brand: body.brand,
      model: body.model,
      licensePlate: body.licensePlate,
      year: body.year,
      clientId: body.clientId,
    });
    return VehicleResponse.fromEntity(vehicle);
  }

  @Get()
  @ApiAuth()
  @ApiOperation({
    summary: 'List all vehicles',
  })
  @ApiOkResponse({ type: [VehicleResponse] })
  async findAll(): Promise<VehicleResponse[]> {
    const vehicles = await this.findAllVehiclesUseCase.execute();
    return vehicles.map(VehicleResponse.fromEntity);
  }

  @Get(':id')
  @ApiAuth()
  @ApiOperation({
    summary: 'Fetch a vehicle by ID',
  })
  @ApiOkResponse({ type: VehicleResponse })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'Vehicle not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<VehicleResponse> {
    const vehicle = await this.findVehicleByIdUseCase.execute(id);
    return VehicleResponse.fromEntity(vehicle);
  }

  @Patch(':id')
  @ApiAuth('ADMIN', 'SERVICE_ADVISOR')
  @ApiOperation({
    summary: 'Updates a vehicle by ID',
  })
  @ApiOkResponse({ type: VehicleResponse })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'Vehicle not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateVehicleRequest,
  ): Promise<VehicleResponse> {
    const vehicle = await this.updateVehicleUseCase.execute(id, {
      brand: body.brand,
      model: body.model,
      year: body.year,
    });
    return VehicleResponse.fromEntity(vehicle);
  }

  @Delete(':id')
  @ApiAuth('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletes a vehicle by ID',
  })
  @ApiNoContentResponse({ description: 'Vehicle deleted successfully' })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'Vehicle not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteVehicleUseCase.execute(id);
  }
}
