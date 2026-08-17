import { Test, type TestingModule } from '@nestjs/testing';
import { VehicleController } from '@vehicle/presentation/vehicle.controller';
import { CreateVehicleUseCase } from '@vehicle/application/use-cases/create-vehicle.use-case';
import { FindAllVehiclesUseCase } from '@vehicle/application/use-cases/find-all-vehicles.use-case';
import { FindVehicleByIdUseCase } from '@vehicle/application/use-cases/find-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from '@vehicle/application/use-cases/update-vehicle.use-case';
import { DeleteVehicleUseCase } from '@vehicle/application/use-cases/delete-vehicle.use-case';
import { makeVehicle } from '../vehicle.factory';

describe('VehicleController', () => {
  const useCases = {
    create: { execute: jest.fn() },
    findAll: { execute: jest.fn() },
    findById: { execute: jest.fn() },
    update: { execute: jest.fn() },
    remove: { execute: jest.fn() },
  };

  let controller: VehicleController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        { provide: CreateVehicleUseCase, useValue: useCases.create },
        { provide: FindAllVehiclesUseCase, useValue: useCases.findAll },
        { provide: FindVehicleByIdUseCase, useValue: useCases.findById },
        { provide: UpdateVehicleUseCase, useValue: useCases.update },
        { provide: DeleteVehicleUseCase, useValue: useCases.remove },
      ],
    }).compile();

    controller = module.get(VehicleController);
  });

  it('create repassa o payload e devolve a placa formatada', async () => {
    useCases.create.execute.mockResolvedValue(makeVehicle({ licensePlate: 'ABC1234' }));

    const body = {
      brand: 'Volkswagen',
      model: 'Gol',
      licensePlate: 'abc-1234',
      year: 2020,
      clientId: '123e4567-e89b-12d3-a456-426614174000',
    };

    const response = await controller.create(body);

    expect(useCases.create.execute).toHaveBeenCalledWith(body);
    expect(response.licensePlate).toBe('ABC-1234');
    expect(response.plateFormat).toBe('OLD');
  });

  it('findAll mapeia a lista inteira', async () => {
    useCases.findAll.execute.mockResolvedValue([
      makeVehicle({ licensePlate: 'ABC1234' }),
      makeVehicle({ licensePlate: 'ABC1D23' }),
    ]);

    const response = await controller.findAll();

    expect(response).toHaveLength(2);
    expect(response[0].plateFormat).toBe('OLD');
    expect(response[1].licensePlate).toBe('ABC1D23');
    expect(response[1].plateFormat).toBe('MERCOSUL');
  });

  it('findOne encaminha o id', async () => {
    const vehicle = makeVehicle();
    useCases.findById.execute.mockResolvedValue(vehicle);

    const response = await controller.findOne(vehicle.id);

    expect(useCases.findById.execute).toHaveBeenCalledWith(vehicle.id);
    expect(response.id).toBe(vehicle.id);
    expect(response.clientId).toBe(vehicle.clientId);
  });

  it('update encaminha id e campos alteráveis', async () => {
    const vehicle = makeVehicle();
    useCases.update.execute.mockResolvedValue(vehicle);

    await controller.update(vehicle.id, { model: 'Polo' });

    expect(useCases.update.execute).toHaveBeenCalledWith(vehicle.id, {
      brand: undefined,
      model: 'Polo',
      year: undefined,
    });
  });

  it('remove não devolve corpo', async () => {
    useCases.remove.execute.mockResolvedValue(undefined);

    await expect(controller.remove('abc')).resolves.toBeUndefined();
    expect(useCases.remove.execute).toHaveBeenCalledWith('abc');
  });
});
