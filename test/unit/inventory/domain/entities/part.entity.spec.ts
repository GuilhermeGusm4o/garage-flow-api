import { Part } from '@inventory/domain/entities/part.entity';
import { UnitOfMeasure } from '@inventory/domain/value-objects/unit-of-measure.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';

describe('Part', () => {
  const buildPart = (quantity = 10, minQuantity = 5) =>
    new Part(
      'part-1',
      'Óleo de motor',
      new UnitOfMeasure('ML'),
      45.9,
      new Quantity(quantity),
      new Quantity(minQuantity),
    );

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

  it('deve atualizar nome e preço', () => {
    const part = buildPart(10);
    part.updateDetails('Óleo sintético 5W40', 59.9);
    expect(part.name).toBe('Óleo sintético 5W40');
    expect(part.unitPrice).toBe(59.9);
  });

  it('deve reportar abaixo do mínimo quando a quantidade estiver abaixo do mínimo da peça', () => {
    const part = buildPart(2, 5);
    expect(part.isBelowMinimum()).toBe(true);
  });

  it('deve reportar não abaixo do mínimo quando a quantidade estiver acima do mínimo da peça', () => {
    const part = buildPart(10, 5);
    expect(part.isBelowMinimum()).toBe(false);
  });

  it('deve usar o mínimo configurado em cada peça, não um valor fixo', () => {
    expect(buildPart(8, 20).isBelowMinimum()).toBe(true);
    expect(buildPart(8, 3).isBelowMinimum()).toBe(false);
  });

  it('não deve considerar abaixo do mínimo quando a quantidade é igual ao mínimo', () => {
    expect(buildPart(5, 5).isBelowMinimum()).toBe(false);
  });

  it('deve assumir mínimo zero quando não informado', () => {
    const part = new Part('part-1', 'Óleo', new UnitOfMeasure('ML'), 45.9, new Quantity(0));
    expect(part.minQuantity.value).toBe(0);
    expect(part.isBelowMinimum()).toBe(false);
  });

  it('deve permitir atualizar o mínimo pelo updateDetails', () => {
    const part = buildPart(8, 5);
    part.updateDetails('Óleo', 45.9, new Quantity(20));
    expect(part.minQuantity.value).toBe(20);
    expect(part.isBelowMinimum()).toBe(true);
  });

  it('deve preservar o mínimo quando updateDetails não o informa', () => {
    const part = buildPart(8, 5);
    part.updateDetails('Óleo novo', 50);
    expect(part.minQuantity.value).toBe(5);
  });
});
