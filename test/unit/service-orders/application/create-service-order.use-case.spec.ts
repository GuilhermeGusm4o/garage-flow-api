import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateServiceOrderUseCase } from '@service-orders/application/use-cases/create-service-order.use-case';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { type CreateServiceOrderDto } from '@service-orders/presentation/dtos/create-service-order.dto';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type FindClientByCpfCnpjUseCase } from '@client/application/use-cases/find-client-by-cpf-cnpj.use-case';
import { type FindVehicleByLicensePlateUseCase } from '@vehicle/application/use-cases/find-vehicle-by-license-plate.use-case';
import { type FindPartByIdUseCase } from '@inventory/application/use-cases/find-part-by-id.use-case';
import { type CalculateAvailabilityUseCase } from '@inventory/application/use-cases/calculate-availability.use-case';
import { type FindServicesByIdListUseCase } from '@service/application/use-cases/find-services-by-id-list.use-case';
import { type CalculateTotalAmountUseCase } from '@service-orders/application/use-cases/calculate-total-amount.use-case';

describe('CreateServiceOrderUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepository>;
  let findClientByCpfCnpj: { execute: jest.Mock };
  let findServicesByIdList: { execute: jest.Mock };
  let findVehicleByLicensePlate: { execute: jest.Mock };
  let findPartById: { execute: jest.Mock };
  let calculateAvailability: { execute: jest.Mock };
  let calculateTotalAmount: { execute: jest.Mock };
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
    findServicesByIdList = { execute: jest.fn().mockResolvedValue([service]) };
    findPartById = { execute: jest.fn().mockResolvedValue(part) };
    calculateAvailability = { execute: jest.fn().mockResolvedValue(10) };
    calculateTotalAmount = { execute: jest.fn().mockResolvedValue(260) };

    useCase = new CreateServiceOrderUseCase(
      repository,
      findClientByCpfCnpj as unknown as FindClientByCpfCnpjUseCase,
      findVehicleByLicensePlate as unknown as FindVehicleByLicensePlateUseCase,
      findPartById as unknown as FindPartByIdUseCase,
      calculateAvailability as unknown as CalculateAvailabilityUseCase,
      findServicesByIdList as unknown as FindServicesByIdListUseCase,
      calculateTotalAmount as unknown as CalculateTotalAmountUseCase,
    );
  });

  const buildDto = (): CreateServiceOrderDto => ({
    clientCpfCnpj: '123.456.789-00',
    licensePlate: 'ABC1D23',
    services: [{ serviceId: 'service-1' }],
    parts: [{ inventoryId: 'part-1', quantity: 2 }],
  });

  it('deve criar a OS com status RECEIVED e valor total calculado pelo CalculateTotalAmountUseCase', async () => {
    const os = await useCase.execute(buildDto());

    expect(os.status).toBe(ServiceOrderStatus.RECEIVED);
    expect(os.vehicleId).toBe('vehicle-1');
    expect(calculateTotalAmount.execute).toHaveBeenCalledWith(os.serviceItems, os.partItems);
    expect(os.totalAmount).toBe(260);
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

  it('deve propagar NotFoundException se o serviço não existir', async () => {
    findServicesByIdList.execute.mockRejectedValue(new NotFoundException('Serviço não encontrado'));

    await expect(useCase.execute(buildDto())).rejects.toThrow(NotFoundException);
  });
});
