import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AddServicesAndPartsUseCase } from '@service-orders/application/use-cases/add-services-and-parts.use-case';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { type AddServicesAndPartsDto } from '@service-orders/presentation/dtos/add-services-and-parts.dto';
import { type FindPartByIdUseCase } from '@inventory/application/use-cases/find-part-by-id.use-case';
import { type CalculateAvailabilityUseCase } from '@inventory/application/use-cases/calculate-availability.use-case';
import { type FindServicesByIdListUseCase } from '@service/application/use-cases/find-services-by-id-list.use-case';
import { type CalculateTotalAmountUseCase } from '@service-orders/application/use-cases/calculate-total-amount.use-case';

describe('AddServicesAndPartsUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepository>;
  let findPartById: { execute: jest.Mock };
  let calculateAvailability: { execute: jest.Mock };
  let findServicesByIdList: { execute: jest.Mock };
  let calculateTotalAmount: { execute: jest.Mock };
  let useCase: AddServicesAndPartsUseCase;

  const service = { id: 'service-1', price: { getValue: () => 100 } };
  const part = { id: 'part-1', name: 'Óleo', unitPrice: 30 };

  const buildServiceOrder = () => ServiceOrder.create('vehicle-1', [], [], 0);

  beforeEach(() => {
    repository = {
      save: jest.fn((serviceOrder) => Promise.resolve(serviceOrder)),
      findById: jest.fn().mockResolvedValue(buildServiceOrder()),
      findAll: jest.fn(),
      softDelete: jest.fn(),
    };
    findServicesByIdList = { execute: jest.fn().mockResolvedValue([service]) };
    findPartById = { execute: jest.fn().mockResolvedValue(part) };
    calculateAvailability = { execute: jest.fn().mockResolvedValue(10) };
    calculateTotalAmount = { execute: jest.fn().mockResolvedValue(160) };

    useCase = new AddServicesAndPartsUseCase(
      repository,
      findPartById as unknown as FindPartByIdUseCase,
      calculateAvailability as unknown as CalculateAvailabilityUseCase,
      findServicesByIdList as unknown as FindServicesByIdListUseCase,
      calculateTotalAmount as unknown as CalculateTotalAmountUseCase,
    );
  });

  const buildDto = (): AddServicesAndPartsDto => ({
    services: [{ serviceId: 'service-1' }],
    parts: [{ inventoryId: 'part-1', quantity: 2 }],
  });

  it('deve adicionar serviços e peças à OS e recalcular o valor total', async () => {
    const os = await useCase.execute('os-1', buildDto());

    expect(repository.findById).toHaveBeenCalledWith('os-1');
    expect(os.serviceItems).toHaveLength(1);
    expect(os.serviceItems[0].serviceId).toBe('service-1');
    expect(os.partItems).toHaveLength(1);
    expect(os.partItems[0].inventoryId).toBe('part-1');
    expect(calculateTotalAmount.execute).toHaveBeenCalledWith(os.serviceItems, os.partItems);
    expect(os.totalAmount).toBe(160);
    expect(repository.save).toHaveBeenCalledWith(os);
  });

  it('deve preservar os itens já existentes na OS ao adicionar novos', async () => {
    const existingServiceOrder = ServiceOrder.create('vehicle-1', [], [], 0);
    existingServiceOrder.addServicesAndParts(
      [new ServiceItem(null, 'service-existing', 50)],
      [],
      50,
    );
    repository.findById.mockResolvedValue(existingServiceOrder);

    const os = await useCase.execute('os-1', buildDto());

    expect(os.serviceItems.map((item) => item.serviceId)).toEqual([
      'service-existing',
      'service-1',
    ]);
  });

  it('deve lançar NotFoundException se a OS não existir', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('os-inexistente', buildDto())).rejects.toThrow(NotFoundException);
  });

  it('deve lançar BadRequestException se a quantidade de peça for maior que a disponível', async () => {
    calculateAvailability.execute.mockResolvedValue(1); // pediu 2, só tem 1

    await expect(useCase.execute('os-1', buildDto())).rejects.toThrow(BadRequestException);
  });

  it('deve propagar NotFoundException se o serviço não existir', async () => {
    findServicesByIdList.execute.mockRejectedValue(new NotFoundException('Serviço não encontrado'));

    await expect(useCase.execute('os-1', buildDto())).rejects.toThrow(NotFoundException);
  });

  it('deve propagar NotFoundException se a peça não existir', async () => {
    findPartById.execute.mockRejectedValue(new NotFoundException('Peça não encontrada'));

    await expect(useCase.execute('os-1', buildDto())).rejects.toThrow(NotFoundException);
  });

  it('não deve chamar dependências de serviço quando não há serviços informados', async () => {
    await useCase.execute('os-1', { services: [], parts: [] });

    expect(findServicesByIdList.execute).not.toHaveBeenCalled();
  });
});
