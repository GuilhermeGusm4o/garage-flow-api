import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateClientUseCase } from '@client/application/use-cases/create-client.use-case';
import { CreateClientRequest } from '@client/presentation/dtos/create-client.request';
import { ClientResponse } from '@client/presentation/dtos/client.response';

@ApiTags('Clients')
@Controller('clients')
export class ClientController {
  constructor(private readonly createClientUseCase: CreateClientUseCase) {}

  @Post()
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
}
