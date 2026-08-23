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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateClientUseCase } from '@client/application/use-cases/create-client.use-case';
import { FindAllClientsUseCase } from '@client/application/use-cases/find-all-clients.use-case';
import { FindClientByIdUseCase } from '@client/application/use-cases/find-client-by-id.use-case';
import { UpdateClientUseCase } from '@client/application/use-cases/update-client.use-case';
import { DeleteClientUseCase } from '@client/application/use-cases/delete-client.use-case';
import { CreateClientRequest } from '@client/presentation/dtos/create-client.request';
import { UpdateClientRequest } from '@client/presentation/dtos/update-client.request';
import { ClientResponse } from '@client/presentation/dtos/client.response';
import { JwtAuthGuard } from '@auth/infrastructure/security/jwt-auth.guard';
import { Roles } from '@auth/infrastructure/security/roles.decorator';
import { RolesGuard } from '@auth/infrastructure/security/roles.guard';

@ApiTags('Clients')
@Controller('clients')
export class ClientController {
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly findAllClientsUseCase: FindAllClientsUseCase,
    private readonly findClientByIdUseCase: FindClientByIdUseCase,
    private readonly updateClientUseCase: UpdateClientUseCase,
    private readonly deleteClientUseCase: DeleteClientUseCase,
  ) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @ApiOperation({
    summary: 'Creates a new client',
  })
  @ApiCreatedResponse({ type: ClientResponse })
  @ApiBadRequestResponse({ description: 'Invalid CPF/CNPJ or payload' })
  @ApiConflictResponse({ description: 'Client with this CPF/CNPJ already exists' })
  async create(@Body() body: CreateClientRequest): Promise<ClientResponse> {
    const client = await this.createClientUseCase.execute({
      cpfCnpj: body.cpfCnpj,
      name: body.name,
      phone: body.phone,
      address: body.address,
      email: body.email,
    });
    return ClientResponse.fromEntity(client);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List all clients',
  })
  @ApiOkResponse({ type: [ClientResponse] })
  async findAll(): Promise<ClientResponse[]> {
    const clients = await this.findAllClientsUseCase.execute();
    return clients.map(ClientResponse.fromEntity);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Fetch a client by ID',
  })
  @ApiOkResponse({ type: ClientResponse })
  @ApiNotFoundResponse({ description: 'Client not found' })
  async findOne(@Param('id') id: string): Promise<ClientResponse> {
    const client = await this.findClientByIdUseCase.execute(id);
    return ClientResponse.fromEntity(client);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SERVICE_ADVISOR')
  @ApiOperation({
    summary: 'Updates a client by ID',
  })
  @ApiOkResponse({ type: ClientResponse })
  @ApiNotFoundResponse({ description: 'Client not found' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateClientRequest,
  ): Promise<ClientResponse> {
    const client = await this.updateClientUseCase.execute(id, {
      name: body.name,
      phone: body.phone,
      address: body.address,
      email: body.email,
    });
    return ClientResponse.fromEntity(client);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletes a client by ID',
  })
  @ApiNoContentResponse({ description: 'Client deleted successfully' })
  @ApiNotFoundResponse({ description: 'Client not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteClientUseCase.execute(id);
  }
}
