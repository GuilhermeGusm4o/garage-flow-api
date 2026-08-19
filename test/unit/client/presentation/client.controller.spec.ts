import { Test, type TestingModule } from '@nestjs/testing';
import { ClientController } from '@client/presentation/client.controller';
import { CreateClientUseCase } from '@client/application/use-cases/create-client.use-case';
import { FindAllClientsUseCase } from '@client/application/use-cases/find-all-clients.use-case';
import { FindClientByIdUseCase } from '@client/application/use-cases/find-client-by-id.use-case';
import { UpdateClientUseCase } from '@client/application/use-cases/update-client.use-case';
import { DeleteClientUseCase } from '@client/application/use-cases/delete-client.use-case';
import { makeClient } from '../client.factory';

describe('ClientController', () => {
  const useCases = {
    create: { execute: jest.fn() },
    findAll: { execute: jest.fn() },
    findById: { execute: jest.fn() },
    update: { execute: jest.fn() },
    remove: { execute: jest.fn() },
  };

  let controller: ClientController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        { provide: CreateClientUseCase, useValue: useCases.create },
        { provide: FindAllClientsUseCase, useValue: useCases.findAll },
        { provide: FindClientByIdUseCase, useValue: useCases.findById },
        { provide: UpdateClientUseCase, useValue: useCases.update },
        { provide: DeleteClientUseCase, useValue: useCases.remove },
      ],
    }).compile();

    controller = module.get(ClientController);
  });

  it('create repassa o payload e devolve o documento mascarado', async () => {
    useCases.create.execute.mockResolvedValue(makeClient());

    const response = await controller.create({
      cpfCnpj: '529.982.247-25',
      name: 'João da Silva',
      phone: '11999998888',
      address: 'Rua das Flores, 123',
      email: 'joao@email.com',
    });

    expect(useCases.create.execute).toHaveBeenCalledWith({
      cpfCnpj: '529.982.247-25',
      name: 'João da Silva',
      phone: '11999998888',
      address: 'Rua das Flores, 123',
      email: 'joao@email.com',
    });
    expect(response.cpfCnpj).toBe('529.982.247-25');
    expect(response.documentType).toBe('CPF');
  });

  it('findAll mapeia a lista inteira', async () => {
    useCases.findAll.execute.mockResolvedValue([
      makeClient(),
      makeClient({ cpfCnpj: '11222333000181' }),
    ]);

    const response = await controller.findAll();

    expect(response).toHaveLength(2);
    expect(response[1].cpfCnpj).toBe('11.222.333/0001-81');
    expect(response[1].documentType).toBe('CNPJ');
  });

  it('findOne encaminha o id', async () => {
    const client = makeClient();
    useCases.findById.execute.mockResolvedValue(client);

    const response = await controller.findOne(client.id);

    expect(useCases.findById.execute).toHaveBeenCalledWith(client.id);
    expect(response.id).toBe(client.id);
  });

  it('update encaminha id e campos alteráveis', async () => {
    const client = makeClient();
    useCases.update.execute.mockResolvedValue(client);

    await controller.update(client.id, { name: 'Maria Souza' });

    expect(useCases.update.execute).toHaveBeenCalledWith(client.id, {
      name: 'Maria Souza',
      phone: undefined,
      address: undefined,
      email: undefined,
    });
  });

  it('remove não devolve corpo', async () => {
    useCases.remove.execute.mockResolvedValue(undefined);

    await expect(controller.remove('abc')).resolves.toBeUndefined();
    expect(useCases.remove.execute).toHaveBeenCalledWith('abc');
  });
});
