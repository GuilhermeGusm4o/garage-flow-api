import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';

describe('UnitOfMeasure', () => {
  it.each(['ML', 'G', 'KG', 'UNIT'])('deve aceitar o valor válido %s', (value) => {
    expect(() => new UnitOfMeasure(value)).not.toThrow();
  });

  it('deve rejeitar um valor inválido', () => {
    expect(() => new UnitOfMeasure('LITROS')).toThrow('Invalid unit of measure: LITROS');
  });
});
