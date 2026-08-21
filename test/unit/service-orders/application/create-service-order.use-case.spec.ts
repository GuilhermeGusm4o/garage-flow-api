import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateServiceOrderUseCase } from '@service-orders/application/use-cases/create-service-order.use-case';
import { ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { CreateServiceOrderDto } from '@service-orders/presentation/dtos/create-service-order.dto';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

describe('CreateServiceOrderUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepository>;
  let findClientByCpfCnpj: { execute: jest.Mock };
  let findVehicleByLicensePlate: { execute: jest.Mock };
  let findServiceById: { execute: jest.Mock };
  let findPartById: { execute: jest.Mock };
  let calculateAvailability: { execute: jest.Mock };
  let useCase: CreateServiceOrderUseCase;

  const client = { id: 'client-1' };
  const vehicle = { id: 'vehicle-1', clientId: 'client-1' };
  const service = { id: 'service-1', price: { getValue: () => 100 } };
  const part = { id: 'part-1', name: 'Óleo', unitPrice: 30 };

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      softDelete: jest.fn(),
    };
    findClientByCpfCnpj = { execute: jest.fn().mockResolvedValue(client) };
    findVehicleByLicensePlate = { execute: jest.fn().mockResolvedValue(vehicle) };
    findServiceById = { execute: jest.fn().mockResolvedValue(service) };
    findPartById = { execute: jest.fn().mockResolvedValue(part) };
    calculateAvailability = { execute: jest.fn().mockResolvedValue(10) };

    useCase = new CreateServiceOrderUseCase(
      repository,
      findClientByCpfCnpj as any,
      findVehicleByLicensePlate as any,
      findServiceById as any,
      findPartById as any,
      calculateAvailability as any,
    );
  });

  const buildDto = (): CreateServiceOrderDto => ({
    clientCpfCnpj: '123.456.789-00',
    licensePlate: 'ABC1D23',
    services: [{ serviceId: 'service-1' }],
    parts: [{ inventoryId: 'part-1', quantity: 2 }],
  });

  it('deve criar a OS com status RECEIVED e valor total correto', async () => {
    const os = await useCase.execute(buildDto());

    expect(os.status).toBe(ServiceOrderStatus.RECEIVED);
    expect(os.vehicleId).toBe('vehicle-1');
    expect(os.totalAmount).toBe(160); // 100 (serviço) + 2*30 (peça)
    expect(repository.save).toHaveBeenCalledWith(os);
  });

  it('deve lançar BadRequestException se o veículo não pertencer ao cliente', async () => {
    findVehicleByLicensePlate.execute.mockResolvedValue({
      id: 'vehicle-1',
      clientId: 'outro-cliente',
    });

    await expect(useCase.execute(buildDto())).rejects.toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException se a quantidade de peça for maior que a disponível', async () => {
    calculateAvailability.execute.mockResolvedValue(1); // pediu 2, só tem 1

    await expect(useCase.execute(buildDto())).rejects.toThrow(BadRequestException);
  });

  it('deve propagar NotFoundException se o cliente não existir', async () => {
    findClientByCpfCnpj.execute.mockRejectedValue(new NotFoundException('Cliente não encontrado'));

    await expect(useCase.execute(buildDto())).rejects.toThrow(NotFoundException);
  });
});
