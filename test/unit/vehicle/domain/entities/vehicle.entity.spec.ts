import { FIXED_DATE, makeVehicle } from '../../vehicle.factory';

describe('VehicleEntity', () => {
  it('expõe os campos do schema', () => {
    const vehicle = makeVehicle({ brand: 'Fiat', model: 'Uno', year: 2015 });

    expect(vehicle.brand).toBe('Fiat');
    expect(vehicle.model).toBe('Uno');
    expect(vehicle.year).toBe(2015);
    expect(vehicle.clientId).toEqual(expect.any(String));
  });

  it('guarda a placa como Value Object', () => {
    const vehicle = makeVehicle({ licensePlate: 'abc-1234' });

    expect(vehicle.licensePlate.value).toBe('ABC1234');
    expect(vehicle.licensePlate.type).toBe('OLD');
  });

  it('nasce sem deletedAt', () => {
    const vehicle = makeVehicle();

    expect(vehicle.deletedAt).toBeNull();
    expect(vehicle.isDeleted).toBe(false);
  });

  describe('update', () => {
    it('altera apenas os campos informados e atualiza updatedAt', () => {
      const vehicle = makeVehicle();

      vehicle.update({ model: 'Polo' });

      expect(vehicle.model).toBe('Polo');
      expect(vehicle.brand).toBe('Volkswagen');
      expect(vehicle.year).toBe(2020);
      expect(vehicle.updatedAt.getTime()).toBeGreaterThan(FIXED_DATE.getTime());
      expect(vehicle.createdAt).toEqual(FIXED_DATE);
    });

    it('ignora campos undefined', () => {
      const vehicle = makeVehicle();

      vehicle.update({ brand: undefined, year: undefined });

      expect(vehicle.brand).toBe('Volkswagen');
      expect(vehicle.year).toBe(2020);
    });

    it('não expõe forma de trocar placa nem dono', () => {
      const vehicle = makeVehicle();
      const { clientId } = vehicle;

      vehicle.update({ model: 'Polo' });

      expect(vehicle.licensePlate.value).toBe('ABC1D23');
      expect(vehicle.clientId).toBe(clientId);
    });
  });

  describe('softDelete', () => {
    it('marca deletedAt e atualiza updatedAt', () => {
      const vehicle = makeVehicle();

      vehicle.softDelete();

      expect(vehicle.isDeleted).toBe(true);
      expect(vehicle.deletedAt).toBeInstanceOf(Date);
      expect(vehicle.updatedAt.getTime()).toBeGreaterThan(FIXED_DATE.getTime());
    });
  });
});
