import { type Vehicle as VehicleModel } from '@generated/prisma/client';
import { VehicleMapper } from '@vehicle/infrastructure/vehicle.mapper';
import { FIXED_DATE, makeVehicle } from '../vehicle.factory';

const raw: VehicleModel = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  brand: 'Volkswagen',
  model: 'Gol',
  licensePlate: 'ABC1D23',
  year: 2020,
  clientId: '999e4567-e89b-12d3-a456-426614174999',
  created_at: FIXED_DATE,
  updated_at: FIXED_DATE,
  deleted_at: null,
};

describe('VehicleMapper', () => {
  describe('toDomain', () => {
    it('monta a entidade a partir do registro do Prisma', () => {
      const vehicle = VehicleMapper.toDomain(raw);

      expect(vehicle.id).toBe(raw.id);
      expect(vehicle.brand).toBe(raw.brand);
      expect(vehicle.model).toBe(raw.model);
      expect(vehicle.licensePlate.value).toBe('ABC1D23');
      expect(vehicle.licensePlate.type).toBe('MERCOSUL');
      expect(vehicle.year).toBe(raw.year);
      expect(vehicle.clientId).toBe(raw.clientId);
      expect(vehicle.createdAt).toEqual(FIXED_DATE);
      expect(vehicle.deletedAt).toBeNull();
    });

    it('propaga deleted_at', () => {
      expect(VehicleMapper.toDomain({ ...raw, deleted_at: FIXED_DATE }).isDeleted).toBe(true);
    });
  });

  describe('toPrisma', () => {
    it('grava a placa normalizada, sem hífen', () => {
      const vehicle = makeVehicle({ licensePlate: 'abc-1234' });

      expect(VehicleMapper.toPrisma(vehicle).licensePlate).toBe('ABC1234');
    });

    it('não envia created_at nem updated_at (controlados pelo banco)', () => {
      const data = VehicleMapper.toPrisma(makeVehicle());

      expect(data).not.toHaveProperty('created_at');
      expect(data).not.toHaveProperty('updated_at');
      expect(Object.keys(data).sort()).toEqual(
        ['brand', 'clientId', 'deleted_at', 'id', 'licensePlate', 'model', 'year'].sort(),
      );
    });

    it('faz round trip sem perder dados', () => {
      const roundTripped = VehicleMapper.toDomain({
        ...VehicleMapper.toPrisma(VehicleMapper.toDomain(raw)),
        created_at: FIXED_DATE,
        updated_at: FIXED_DATE,
      });

      expect(roundTripped.licensePlate.value).toBe(raw.licensePlate);
      expect(roundTripped.brand).toBe(raw.brand);
      expect(roundTripped.year).toBe(raw.year);
      expect(roundTripped.clientId).toBe(raw.clientId);
      expect(roundTripped.deletedAt).toBeNull();
    });
  });
});
