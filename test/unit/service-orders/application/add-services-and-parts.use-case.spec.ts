import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AddServicesAndPartsUseCase } from '@service-orders/application/use-cases/add-services-and-parts.use-case';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { type AddServicesAndPartsDto } from '@service-orders/presentation/dtos/add-services-and-parts.dto';
import { type GetStockLevelUseCase } from '@inventory/application/use-cases/get-stock-level.use-case';
import { StockLevel } from '@inventory/domain/value-objects/stock-level.vo';
import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';
import { type FindServicesByIdListUseCase } from '@service/application/use-cases/find-services-by-id-list.use-case';
import { type CalculateTotalAmountUseCase } from '@service-orders/application/use-cases/calculate-total-amount.use-case';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';

describe('AddServicesAndPartsUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepository>;
  let getStockLevel: { execute: jest.Mock };
  let findServicesByIdList: { execute: jest.Mock };
  let calculateTotalAmount: { execute: jest.Mock };
  let useCase: AddServicesAndPartsUseCase;

  const service = { id: 'service-1', price: { getValue: () => 100 } };

  /** Nível de estoque da peça: `physical` na prateleira, `reserved` já comprometido com OS em aberto. */
  const buildStockLevel = (physical: number, reserved = 0) =>
    new StockLevel(
      new Part('part-1', 'Óleo', new UnitOfMeasure('ML'), 30, new Quantity(physical)),
      reserved,
    );

  const buildServiceOrder = () => {
    const serviceOrder = ServiceOrder.create('vehicle-1', 'Ruído no motor', [], [], 0);
    serviceOrder.updateStatus(ServiceOrderStatus.IN_DIAGNOSIS);
    return serviceOrder;
  };

  beforeEach(() => {
    repository = {
      save: jest.fn((serviceOrder) => Promise.resolve(serviceOrder)),
      findById: jest.fn().mockResolvedValue(buildServiceOrder()),
      findAll: jest.fn(),
      softDelete: jest.fn(),
    };
    findServicesByIdList = { execute: jest.fn().mockResolvedValue([service]) };
    getStockLevel = { execute: jest.fn().mockResolvedValue(buildStockLevel(10)) };
    calculateTotalAmount = { execute: jest.fn().mockResolvedValue(160) };

    useCase = new AddServicesAndPartsUseCase(
      repository,
      getStockLevel as unknown as GetStockLevelUseCase,
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

  it('deve mover a OS para AWAITING_APPROVAL após adicionar serviços e peças', async () => {
    const os = await useCase.execute('os-1', buildDto());

    expect(os.status).toBe(ServiceOrderStatus.AWAITING_APPROVAL);
  });

  it('deve preservar os itens já existentes na OS ao adicionar novos', async () => {
    const existingServiceOrder = buildServiceOrder();
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

  it('deve lançar BadRequestException se a OS não estiver em diagnóstico', async () => {
    const serviceOrder = ServiceOrder.create('vehicle-1', 'Ruído no motor', [], [], 0);
    repository.findById.mockResolvedValue(serviceOrder);

    await expect(useCase.execute('os-1', buildDto())).rejects.toThrow(BadRequestException);
    expect(findServicesByIdList.execute).not.toHaveBeenCalled();
    expect(getStockLevel.execute).not.toHaveBeenCalled();
    expect(calculateTotalAmount.execute).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException ao tentar adicionar itens novamente após a OS já estar em AWAITING_APPROVAL', async () => {
    const serviceOrder = buildServiceOrder();
    serviceOrder.updateStatus(ServiceOrderStatus.AWAITING_APPROVAL);
    repository.findById.mockResolvedValue(serviceOrder);

    await expect(useCase.execute('os-1', buildDto())).rejects.toThrow(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException se a quantidade de peça for maior que a disponível', async () => {
    getStockLevel.execute.mockResolvedValue(buildStockLevel(1)); // pediu 2, só tem 1

    await expect(useCase.execute('os-1', buildDto())).rejects.toThrow(BadRequestException);
  });

  it('deve barrar quando o estoque físico cobre mas outra OS já reservou a peça', async () => {
    // 10 na prateleira, 9 comprometidos com OS em aberto -> só 1 realmente livre
    getStockLevel.execute.mockResolvedValue(buildStockLevel(10, 9));

    await expect(useCase.execute('os-1', buildDto())).rejects.toThrow(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('deve aceitar quando o estoque lógico ainda cobre o pedido', async () => {
    // 10 na prateleira, 5 reservados -> 5 livres, pedido de 2 passa
    getStockLevel.execute.mockResolvedValue(buildStockLevel(10, 5));

    await expect(useCase.execute('os-1', buildDto())).resolves.toBeDefined();
    expect(repository.save).toHaveBeenCalled();
  });

  it('deve propagar NotFoundException se o serviço não existir', async () => {
    findServicesByIdList.execute.mockRejectedValue(new NotFoundException('Serviço não encontrado'));

    await expect(useCase.execute('os-1', buildDto())).rejects.toThrow(NotFoundException);
  });

  it('deve propagar NotFoundException se a peça não existir', async () => {
    getStockLevel.execute.mockRejectedValue(new NotFoundException('Peça não encontrada'));

    await expect(useCase.execute('os-1', buildDto())).rejects.toThrow(NotFoundException);
  });

  it('não deve chamar dependências de serviço quando não há serviços informados', async () => {
    await useCase.execute('os-1', { services: [], parts: [] });

    expect(findServicesByIdList.execute).not.toHaveBeenCalled();
  });
});
