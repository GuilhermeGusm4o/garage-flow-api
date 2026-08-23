import { ServiceOrdersController } from '@service-orders/presentation/service-orders.controller';
import { type CreateServiceOrderDto } from '@service-orders/presentation/dtos/create-service-order.dto';
import { ServiceOrderStatus } from '@service-orders/domain/value-objects/service-order-status.vo';
import { type UpdateServiceOrderDto } from '@service-orders/presentation/dtos/update-service-order.dto';

type ControllerDependencies = ConstructorParameters<typeof ServiceOrdersController>;
type ExecuteMock<TArgs extends unknown[], TResult> = jest.MockedFunction<
  (...args: TArgs) => Promise<TResult>
>;

describe('ServiceOrdersController', () => {
  let controller: ServiceOrdersController;
  let createServiceOrder: { execute: ExecuteMock<[CreateServiceOrderDto], unknown> };
  let findServiceOrderById: { execute: ExecuteMock<[string], unknown> };
  let findAllServiceOrders: { execute: ExecuteMock<[], unknown> };
  let updateServiceOrder: { execute: ExecuteMock<[string, UpdateServiceOrderDto], unknown> };
  let softDeleteServiceOrder: { execute: ExecuteMock<[string], void> };

  beforeEach(() => {
    createServiceOrder = { execute: jest.fn() };
    findServiceOrderById = { execute: jest.fn() };
    findAllServiceOrders = { execute: jest.fn() };
    updateServiceOrder = { execute: jest.fn() };
    softDeleteServiceOrder = { execute: jest.fn() };

    controller = new ServiceOrdersController(
      createServiceOrder as unknown as ControllerDependencies[0],
      findServiceOrderById as unknown as ControllerDependencies[1],
      findAllServiceOrders as unknown as ControllerDependencies[2],
      updateServiceOrder as unknown as ControllerDependencies[3],
      softDeleteServiceOrder as unknown as ControllerDependencies[4],
    );
  });

  it('creates a service order through the use case', async () => {
    const dto: CreateServiceOrderDto = {
      clientCpfCnpj: '52998224725',
      licensePlate: 'ABC1D23',
      services: [{ serviceId: 'service-1' }],
      parts: [{ inventoryId: 'part-1', quantity: 2 }],
    };
    const serviceOrder = { id: 'service-order-1' };
    createServiceOrder.execute.mockResolvedValue(serviceOrder);

    await expect(controller.create(dto)).resolves.toBe(serviceOrder);
    expect(createServiceOrder.execute).toHaveBeenCalledWith(dto);
  });

  it('lists all service orders through the use case', async () => {
    const serviceOrders = [{ id: 'service-order-1' }];
    findAllServiceOrders.execute.mockResolvedValue(serviceOrders);

    await expect(controller.findAll()).resolves.toBe(serviceOrders);
    expect(findAllServiceOrders.execute).toHaveBeenCalledWith();
  });

  it('finds a service order by ID through the use case', async () => {
    const serviceOrder = { id: 'service-order-1' };
    findServiceOrderById.execute.mockResolvedValue(serviceOrder);

    await expect(controller.findOne('service-order-1')).resolves.toBe(serviceOrder);
    expect(findServiceOrderById.execute).toHaveBeenCalledWith('service-order-1');
  });

  it('updates a service order through the use case', async () => {
    const dto: UpdateServiceOrderDto = { status: ServiceOrderStatus.IN_DIAGNOSIS };
    const serviceOrder = { id: 'service-order-1', status: dto.status };
    updateServiceOrder.execute.mockResolvedValue(serviceOrder);

    await expect(controller.update('service-order-1', dto)).resolves.toBe(serviceOrder);
    expect(updateServiceOrder.execute).toHaveBeenCalledWith('service-order-1', dto);
  });

  it('deletes a service order through the use case', async () => {
    softDeleteServiceOrder.execute.mockResolvedValue(undefined);

    await expect(controller.remove('service-order-1')).resolves.toBeUndefined();
    expect(softDeleteServiceOrder.execute).toHaveBeenCalledWith('service-order-1');
  });
});
