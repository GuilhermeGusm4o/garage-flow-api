import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GenerateServiceOrderBudgetUseCase } from '@service-orders/application/use-cases/generate-service-order-budget.use-case';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { ServiceEntity } from '@service/domain/entities/service.entity';
import { ServicePrice } from '@service/domain/value-objects/service-price.value-object';
import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';
import { type FindVehicleByIdUseCase } from '@vehicle/application/use-cases/find-vehicle-by-id.use-case';
import { type FindClientByIdUseCase } from '@client/application/use-cases/find-client-by-id.use-case';
import { type FindServicesByIdListUseCase } from '@service/application/use-cases/find-services-by-id-list.use-case';
import { type FindPartsByIdListUseCase } from '@inventory/application/use-cases/find-parts-by-id-list.use-case';
import { makeClient } from '../../client/client.factory';
import { makeVehicle } from '../../vehicle/vehicle.factory';
import {
  makeServiceOrder,
  makeServiceItem,
  makePartItem,
  makeServiceOrderRepositoryMock,
} from '../service-order.factory';

describe('GenerateServiceOrderBudgetUseCase', () => {
  let repository: ReturnType<typeof makeServiceOrderRepositoryMock>;
  let findVehicleById: { execute: jest.Mock };
  let findClientById: { execute: jest.Mock };
  let findServicesByIdList: { execute: jest.Mock };
  let findPartsByIdList: { execute: jest.Mock };
  let useCase: GenerateServiceOrderBudgetUseCase;

  const FIXED_DATE = new Date('2026-01-01T00:00:00.000Z');
  const client = makeClient({ name: 'João da Silva' });
  const vehicle = makeVehicle({ clientId: client.id, licensePlate: 'ABC1D23' });

  const service = ServiceEntity.create({
    id: crypto.randomUUID(),
    name: 'Troca de óleo',
    price: ServicePrice.create(100),
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
  });

  const part = new Part(
    crypto.randomUUID(),
    'Filtro de óleo',
    new UnitOfMeasure('UNIT'),
    30,
    new Quantity(10),
  );

  const buildServiceOrder = (overrides: Parameters<typeof makeServiceOrder>[0] = {}) =>
    makeServiceOrder({
      vehicleId: vehicle.id,
      status: ServiceOrderStatus.FINISHED_DIAGNOSIS,
      totalAmount: 130,
      serviceItems: [makeServiceItem({ serviceId: service.id, price: 100 })],
      partItems: [makePartItem({ inventoryId: part.id, quantity: 1, unitPrice: 30 })],
      ...overrides,
    });

  beforeEach(() => {
    repository = makeServiceOrderRepositoryMock();
    findVehicleById = { execute: jest.fn().mockResolvedValue(vehicle) };
    findClientById = { execute: jest.fn().mockResolvedValue(client) };
    findServicesByIdList = { execute: jest.fn().mockResolvedValue([service]) };
    findPartsByIdList = { execute: jest.fn().mockResolvedValue([part]) };

    useCase = new GenerateServiceOrderBudgetUseCase(
      repository,
      findVehicleById as unknown as FindVehicleByIdUseCase,
      findClientById as unknown as FindClientByIdUseCase,
      findServicesByIdList as unknown as FindServicesByIdListUseCase,
      findPartsByIdList as unknown as FindPartsByIdListUseCase,
    );
  });

  it('deve retornar os dados do orçamento com cliente, veículo, serviços e peças', async () => {
    const serviceOrder = buildServiceOrder();
    repository.findById.mockResolvedValue(serviceOrder);

    const budget = await useCase.execute(serviceOrder.id);

    expect(findVehicleById.execute).toHaveBeenCalledWith(serviceOrder.vehicleId);
    expect(findClientById.execute).toHaveBeenCalledWith(vehicle.clientId);
    expect(findServicesByIdList.execute).toHaveBeenCalledWith([service.id]);
    expect(findPartsByIdList.execute).toHaveBeenCalledWith([part.id]);

    expect(budget.serviceOrderId).toBe(serviceOrder.id);
    expect(budget.status).toBe(ServiceOrderStatus.FINISHED_DIAGNOSIS);
    expect(budget.totalAmount).toBe(130);
    expect(budget.client).toEqual({
      name: 'João da Silva',
      cpfCnpj: client.cpfCnpj.value,
      phone: client.phone,
      address: client.address,
      email: client.email,
    });
    expect(budget.vehicle).toEqual({
      brand: vehicle.brand,
      model: vehicle.model,
      licensePlate: 'ABC1D23',
      year: vehicle.year,
    });
    expect(budget.services).toEqual([
      { name: 'Troca de óleo', quantity: 1, unitOfMeasure: null, unitPrice: 100, subtotal: 100 },
    ]);
    expect(budget.parts).toEqual([
      { name: 'Filtro de óleo', quantity: 1, unitOfMeasure: 'UNIT', unitPrice: 30, subtotal: 30 },
    ]);
    expect(budget.generatedAt).toBeInstanceOf(Date);
  });

  it('não deve buscar serviços quando a OS não possui itens de serviço', async () => {
    const serviceOrder = buildServiceOrder({ serviceItems: [] });
    repository.findById.mockResolvedValue(serviceOrder);

    const budget = await useCase.execute(serviceOrder.id);

    expect(findServicesByIdList.execute).not.toHaveBeenCalled();
    expect(budget.services).toEqual([]);
  });

  it('não deve buscar peças quando a OS não possui itens de peça', async () => {
    const serviceOrder = buildServiceOrder({ partItems: [] });
    repository.findById.mockResolvedValue(serviceOrder);

    const budget = await useCase.execute(serviceOrder.id);

    expect(findPartsByIdList.execute).not.toHaveBeenCalled();
    expect(budget.parts).toEqual([]);
  });

  it('deve lançar NotFoundException se uma peça referenciada pela OS não for retornada pela busca em lote', async () => {
    const serviceOrder = buildServiceOrder();
    repository.findById.mockResolvedValue(serviceOrder);
    findPartsByIdList.execute.mockResolvedValue([]);

    await expect(useCase.execute(serviceOrder.id)).rejects.toThrow(NotFoundException);
  });

  it('deve lançar NotFoundException se um serviço referenciado pela OS não for retornado pela busca em lote', async () => {
    const serviceOrder = buildServiceOrder();
    repository.findById.mockResolvedValue(serviceOrder);
    findServicesByIdList.execute.mockResolvedValue([]);

    await expect(useCase.execute(serviceOrder.id)).rejects.toThrow(NotFoundException);
  });

  it('deve lançar NotFoundException se o serviço encontrado não possuir nome', async () => {
    const serviceOrder = buildServiceOrder();
    repository.findById.mockResolvedValue(serviceOrder);
    const serviceWithoutName = ServiceEntity.create({
      id: service.id,
      name: '',
      price: ServicePrice.create(100),
      createdAt: FIXED_DATE,
      updatedAt: FIXED_DATE,
    });
    findServicesByIdList.execute.mockResolvedValue([serviceWithoutName]);

    await expect(useCase.execute(serviceOrder.id)).rejects.toThrow(NotFoundException);
  });

  it('deve lançar NotFoundException se a OS não existir', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('inexistente')).rejects.toThrow(NotFoundException);
  });

  it.each([
    ServiceOrderStatus.RECEIVED,
    ServiceOrderStatus.IN_DIAGNOSIS,
    ServiceOrderStatus.AWAITING_APPROVAL,
  ])(
    'deve lançar BadRequestException se a OS estiver com status %s',
    async (status) => {
      const serviceOrder = buildServiceOrder({ status });
      repository.findById.mockResolvedValue(serviceOrder);

      await expect(useCase.execute(serviceOrder.id)).rejects.toThrow(BadRequestException);
    },
  );

  it('deve lançar BadRequestException se a OS não possuir serviços nem peças', async () => {
    const serviceOrder = buildServiceOrder({ serviceItems: [], partItems: [] });
    repository.findById.mockResolvedValue(serviceOrder);

    await expect(useCase.execute(serviceOrder.id)).rejects.toThrow(BadRequestException);
  });
});
