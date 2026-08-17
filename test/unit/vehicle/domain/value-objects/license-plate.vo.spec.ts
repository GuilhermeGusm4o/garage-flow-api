import {
  InvalidLicensePlateError,
  LicensePlate,
} from '@vehicle/domain/value-objects/license-plate.vo';

describe('LicensePlate', () => {
  describe('padrão antigo', () => {
    it('aceita 3 letras + 4 dígitos', () => {
      const plate = LicensePlate.create('ABC1234');

      expect(plate.value).toBe('ABC1234');
      expect(plate.type).toBe('OLD');
      expect(plate.isOld()).toBe(true);
      expect(plate.isMercosul()).toBe(false);
    });

    it('normaliza hífen, espaços e minúsculas', () => {
      expect(LicensePlate.create('abc-1234').value).toBe('ABC1234');
      expect(LicensePlate.create(' ABC 1234 ').value).toBe('ABC1234');
    });

    it('exibe com hífen', () => {
      expect(LicensePlate.create('ABC1234').format()).toBe('ABC-1234');
    });
  });

  describe('padrão Mercosul', () => {
    it('aceita 3 letras + dígito + letra + 2 dígitos', () => {
      const plate = LicensePlate.create('ABC1D23');

      expect(plate.value).toBe('ABC1D23');
      expect(plate.type).toBe('MERCOSUL');
      expect(plate.isMercosul()).toBe(true);
      expect(plate.isOld()).toBe(false);
    });

    it('normaliza minúsculas', () => {
      expect(LicensePlate.create('abc1d23').value).toBe('ABC1D23');
    });

    it('exibe sem hífen', () => {
      expect(LicensePlate.create('ABC1D23').format()).toBe('ABC1D23');
    });
  });

  describe('entradas inválidas', () => {
    it.each([
      ['', 'vazia'],
      ['   ', 'só espaços'],
      ['AB1234', 'letras de menos'],
      ['ABCD123', 'letra na posição do dígito'],
      ['ABC12345', 'caracteres demais'],
      ['ABC123', 'caracteres de menos'],
      ['1234ABC', 'ordem invertida'],
      ['ABC1DD3', 'duas letras no bloco final'],
      ['ÁBC1234', 'acento'],
    ])('rejeita "%s" (%s)', (input: string) => {
      expect(LicensePlate.isValid(input)).toBe(false);
      expect(() => LicensePlate.create(input)).toThrow(InvalidLicensePlateError);
    });
  });

  it('compara pelo valor normalizado', () => {
    expect(LicensePlate.create('abc-1234').equals(LicensePlate.create('ABC1234'))).toBe(true);
    expect(LicensePlate.create('ABC1234').equals(LicensePlate.create('ABC1D23'))).toBe(false);
  });

  it('serializa para a placa normalizada', () => {
    expect(`${LicensePlate.create('abc-1234')}`).toBe('ABC1234');
  });
});
