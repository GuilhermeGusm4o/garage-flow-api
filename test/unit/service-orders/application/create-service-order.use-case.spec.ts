import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateServiceOrderUseCase } from '@service-orders/application/use-cases/create-service-order.use-case';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { type CreateServiceOrderDto } from '@service-orders/presentation/dtos/create-service-order.dto';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

type UseCaseDependencies = ConstructorParameters<typeof CreateServiceOrderUseCase>;
type ExecuteMock<TResult> = jest.MockedFunction<(id: string) => Promise<TResult>>;
type ClientLookup = { execute: ExecuteMock<{ id: string }> };
type VehicleLookup = { execute: ExecuteMock<{ id: string; clientId: string }> };
type ServiceLookup = { execute: ExecuteMock<{ id: string; price: { getValue: () => number } }> };
type PartLookup = {
  execute: ExecuteMock<{ id: string; name: string; unitPrice: number }>;
};
type AvailabilityLookup = { execute: ExecuteMock<number> };

describe('CreateServiceOrderUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepository>;
  let findClientByCpfCnpj: ClientLookup;
  let findVehicleByLicensePlate: VehicleLookup;
  let findServiceById: ServiceLookup;
  let findPartById: PartLookup;
  let calculateAvailability: AvailabilityLookup;
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
      findClientByCpfCnpj as unknown as UseCaseDependencies[1],
      findVehicleByLicensePlate as unknown as UseCaseDependencies[2],
      findServiceById as unknown as UseCaseDependencies[3],
      findPartById as unknown as UseCaseDependencies[4],
      calculateAvailability as unknown as UseCaseDependencies[5],
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
