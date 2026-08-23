import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateServiceOrderUseCase } from '@service-orders/application/use-cases/create-service-order.use-case';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { type CreateServiceOrderDto } from '@service-orders/presentation/dtos/create-service-order.dto';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type FindClientByCpfCnpjUseCase } from '@client/application/use-cases/find-client-by-cpf-cnpj.use-case';
import { type FindVehicleByLicensePlateUseCase } from '@vehicle/application/use-cases/find-vehicle-by-license-plate.use-case';

describe('CreateServiceOrderUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepository>;
  let findClientByCpfCnpj: { execute: jest.Mock };
  let findVehicleByLicensePlate: { execute: jest.Mock };
  let useCase: CreateServiceOrderUseCase;

  const client = { id: 'client-1' };
  const vehicle = { id: 'vehicle-1', clientId: 'client-1' };

  beforeEach(() => {
    repository = {
      save: jest.fn((serviceOrder) => Promise.resolve(serviceOrder)),
      findById: jest.fn(),
      findAll: jest.fn(),
      softDelete: jest.fn(),
    };
    findClientByCpfCnpj = { execute: jest.fn().mockResolvedValue(client) };
    findVehicleByLicensePlate = { execute: jest.fn().mockResolvedValue(vehicle) };

    useCase = new CreateServiceOrderUseCase(
      repository,
      findClientByCpfCnpj as unknown as FindClientByCpfCnpjUseCase,
      findVehicleByLicensePlate as unknown as FindVehicleByLicensePlateUseCase,
    );
  });

  const buildDto = (): CreateServiceOrderDto => ({
    clientCpfCnpj: '123.456.789-00',
    licensePlate: 'ABC1D23',
  });

  it('deve criar a OS com status RECEIVED, sem itens e valor total zerado', async () => {
    const os = await useCase.execute(buildDto());

    expect(os.status).toBe(ServiceOrderStatus.RECEIVED);
    expect(os.vehicleId).toBe('vehicle-1');
    expect(os.serviceItems).toEqual([]);
    expect(os.partItems).toEqual([]);
    expect(os.totalAmount).toBe(0);
    expect(repository.save).toHaveBeenCalledWith(os);
  });

  it('deve lançar BadRequestException se o veículo não pertencer ao cliente', async () => {
    findVehicleByLicensePlate.execute.mockResolvedValue({
      id: 'vehicle-1',
      clientId: 'outro-cliente',
    });

    await expect(useCase.execute(buildDto())).rejects.toThrow(BadRequestException);
  });

  it('deve propagar NotFoundException se o cliente não existir', async () => {
    findClientByCpfCnpj.execute.mockRejectedValue(new NotFoundException('Cliente não encontrado'));

    await expect(useCase.execute(buildDto())).rejects.toThrow(NotFoundException);
  });

  it('deve propagar NotFoundException se o veículo não existir', async () => {
    findVehicleByLicensePlate.execute.mockRejectedValue(
      new NotFoundException('Veículo não encontrado'),
    );

    await expect(useCase.execute(buildDto())).rejects.toThrow(NotFoundException);
  });
});
