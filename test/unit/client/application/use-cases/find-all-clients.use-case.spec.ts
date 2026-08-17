import { FindAllClientsUseCase } from '@client/application/use-cases/find-all-clients.use-case';
import { type ClientRepository } from '@client/domain/repositories/client.repository';
import { makeClient, makeClientRepositoryMock } from '../../client.factory';

describe('FindAllClientsUseCase', () => {
  let repository: jest.Mocked<ClientRepository>;
  let useCase: FindAllClientsUseCase;

  beforeEach(() => {
    repository = makeClientRepositoryMock();
    useCase = new FindAllClientsUseCase(repository);
  });

  it('devolve os clientes do repositório', async () => {
    const clients = [makeClient(), makeClient({ cpfCnpj: '11222333000181' })];
    repository.findAll.mockResolvedValue(clients);

    await expect(useCase.execute()).resolves.toBe(clients);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it('devolve lista vazia quando não há clientes', async () => {
    repository.findAll.mockResolvedValue([]);

    await expect(useCase.execute()).resolves.toEqual([]);
  });
});
