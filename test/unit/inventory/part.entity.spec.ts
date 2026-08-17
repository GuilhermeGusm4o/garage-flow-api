import { Part } from '../../../src/inventory/domain/entities/part.entity';
import { UnitOfMeasure } from '../../../src/inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '../../../src/inventory/domain/value-objects/quantity.vo';

describe('Part', () => {
  const buildPart = (quantity = 10) =>
    new Part('part-1', 'Óleo de motor', new UnitOfMeasure('ML'), 45.9, new Quantity(quantity));

  it('deve repor um estoque corretamente', () => {
    const part = buildPart(10);
    part.restock(5);
    expect(part.quantity.value).toBe(15);
  });

  it('deve consumir corretamente', () => {
    const part = buildPart(10);
    part.consume(4);
    expect(part.quantity.value).toBe(6);
  });

  it('deve lançar um erro ao consumir mais do que o disponível', () => {
    const part = buildPart(3);
    expect(() => part.consume(5)).toThrow('Estoque insuficiente');
  });

  it('deve reportar abaixo do mínimo quando a quantidade estiver abaixo do limite fixo', () => {
    const part = buildPart(2);
    expect(part.isBelowMinimum()).toBe(true);
  });

  it('deve reportar não abaixo do mínimo quando a quantidade estiver acima do limite', () => {
    const part = buildPart(10);
    expect(part.isBelowMinimum()).toBe(false);
  });
});
