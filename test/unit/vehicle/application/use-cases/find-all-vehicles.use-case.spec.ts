import { FindAllVehiclesUseCase } from '@vehicle/application/use-cases/find-all-vehicles.use-case';
import { type VehicleRepository } from '@vehicle/domain/repositories/vehicle.repository';
import { makeVehicle, makeVehicleRepositoryMock } from '../../vehicle.factory';

describe('FindAllVehiclesUseCase', () => {
  let repository: jest.Mocked<VehicleRepository>;
  let useCase: FindAllVehiclesUseCase;

  beforeEach(() => {
    repository = makeVehicleRepositoryMock();
    useCase = new FindAllVehiclesUseCase(repository);
  });

  it('devolve os veículos do repositório', async () => {
    const vehicles = [makeVehicle(), makeVehicle({ licensePlate: 'XYZ9876' })];
    repository.findAll.mockResolvedValue(vehicles);

    await expect(useCase.execute()).resolves.toBe(vehicles);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it('devolve lista vazia quando não há veículos', async () => {
    repository.findAll.mockResolvedValue([]);

    await expect(useCase.execute()).resolves.toEqual([]);
  });
});
