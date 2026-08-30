import { NotFoundException } from '@nestjs/common';
import { FindVehicleByLicensePlateUseCase } from '@vehicle/application/use-cases/find-vehicle-by-license-plate.use-case';
import { type VehicleRepository } from '@vehicle/domain/repositories/vehicle.repository';
import { makeVehicle, makeVehicleRepositoryMock } from '../../vehicle.factory';

describe('FindVehicleByLicensePlateUseCase', () => {
  let repository: jest.Mocked<VehicleRepository>;
  let useCase: FindVehicleByLicensePlateUseCase;

  beforeEach(() => {
    repository = makeVehicleRepositoryMock();
    useCase = new FindVehicleByLicensePlateUseCase(repository);
  });

  it('devolve o veículo encontrado pela placa', async () => {
    const vehicle = makeVehicle({ licensePlate: 'ABC1D23' });
    repository.findByLicensePlate.mockResolvedValue(vehicle);

    await expect(useCase.execute('ABC1D23')).resolves.toBe(vehicle);
    expect(repository.findByLicensePlate).toHaveBeenCalledWith('ABC1D23');
  });

  it('lança 404 quando nenhum veículo tem a placa informada', async () => {
    repository.findByLicensePlate.mockResolvedValue(null);

    await expect(useCase.execute('ZZZ9Z99')).rejects.toThrow(NotFoundException);
  });
});
