import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AddServicesAndPartsUseCase } from '@service-orders/application/use-cases/add-services-and-parts.use-case';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { type ServiceOrderRepository } from '@service-orders/domain/repositories/service-order.repository';
import { type AddServicesAndPartsDto } from '@service-orders/presentation/dtos/add-services-and-parts.dto';
import { type FindPartByIdUseCase } from '@inventory/application/use-cases/find-part-by-id.use-case';
import { type CalculateAvailabilityUseCase } from '@inventory/application/use-cases/calculate-availability.use-case';
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
  let findPartById: { execute: jest.Mock };
  let calculateAvailability: { execute: jest.Mock };
  let findServicesByIdList: { execute: jest.Mock };
  let calculateTotalAmount: { execute: jest.Mock };
  let getStockLevel: { execute: jest.Mock };
  let useCase: AddServicesAndPartsUseCase;

  const buildStockLevel = (quantity: number, minQuantity: number, reserved: number) =>
    new StockLevel(
      new Part(
        'part-1',
        'Óleo',
        new UnitOfMeasure('ML'),
        30,
        new Quantity(quantity),
        new Quantity(minQuantity),
      ),
      reserved,
    );

  const service = { id: 'service-1', price: { getValue: () => 100 } };
  const part = { id: 'part-1', name: 'Óleo', unitPrice: 30, unitOfMeasure: { value: 'ML' } };

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
    findPartById = { execute: jest.fn().mockResolvedValue(part) };
    calculateAvailability = { execute: jest.fn().mockResolvedValue(10) };
    calculateTotalAmount = { execute: jest.fn().mockResolvedValue(160) };
    getStockLevel = { execute: jest.fn().mockResolvedValue(buildStockLevel(100, 5, 0)) };

    useCase = new AddServicesAndPartsUseCase(
      repository,
      findPartById as unknown as FindPartByIdUseCase,
      calculateAvailability as unknown as CalculateAvailabilityUseCase,
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
    const { serviceOrder: os } = await useCase.execute('os-1', buildDto());

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
    const { serviceOrder: os } = await useCase.execute('os-1', buildDto());

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

    const { serviceOrder: os } = await useCase.execute('os-1', buildDto());

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
    expect(findPartById.execute).not.toHaveBeenCalled();
    expect(calculateAvailability.execute).not.toHaveBeenCalled();
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

  describe('alerta de estoque mínimo', () => {
    it('acusa a peça cujo estoque lógico ficou abaixo do mínimo', async () => {
      getStockLevel.execute.mockResolvedValue(buildStockLevel(20, 10, 18));

      const { stockAlerts } = await useCase.execute('os-1', buildDto());

      expect(stockAlerts).toHaveLength(1);
      expect(stockAlerts[0].part.id).toBe('part-1');
      expect(stockAlerts[0].availableQuantity).toBe(2);
      expect(stockAlerts[0].part.minQuantity.value).toBe(10);
    });

    it('não acusa nada quando o estoque lógico cobre o mínimo', async () => {
      getStockLevel.execute.mockResolvedValue(buildStockLevel(100, 5, 0));

      const { stockAlerts } = await useCase.execute('os-1', buildDto());

      expect(stockAlerts).toEqual([]);
    });

    it('usa o estoque lógico, e não o físico, para decidir o alerta', async () => {
      getStockLevel.execute.mockResolvedValue(buildStockLevel(20, 10, 18));

      const { stockAlerts } = await useCase.execute('os-1', buildDto());

      expect(stockAlerts[0].part.isBelowMinimum()).toBe(false);
      expect(stockAlerts[0].isBelowMinimum()).toBe(true);
    });

    it('consulta o nível de estoque só depois de salvar a OS', async () => {
      const order: string[] = [];
      repository.save.mockImplementation((serviceOrder) => {
        order.push('save');
        return Promise.resolve(serviceOrder);
      });
      getStockLevel.execute.mockImplementation(() => {
        order.push('stock');
        return Promise.resolve(buildStockLevel(100, 5, 0));
      });

      await useCase.execute('os-1', buildDto());

      expect(order).toEqual(['save', 'stock']);
    });

    it('consulta cada peça uma única vez mesmo se repetida no payload', async () => {
      await useCase.execute('os-1', {
        services: [],
        parts: [
          { inventoryId: 'part-1', quantity: 1 },
          { inventoryId: 'part-1', quantity: 2 },
        ],
      });

      expect(getStockLevel.execute).toHaveBeenCalledTimes(1);
    });
  });
});
