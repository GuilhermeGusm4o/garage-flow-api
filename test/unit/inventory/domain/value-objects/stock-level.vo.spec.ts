import { StockLevel } from '@inventory/domain/value-objects/stock-level.vo';
import { Quantity } from '@inventory/domain/value-objects/quantity.vo';
import { makePart } from '../../part.factory';

const buildPart = (quantity: number, minQuantity: number) =>
  makePart({
    id: 'part-1',
    name: 'Óleo de motor',
    unitPrice: 45.9,
    quantity: new Quantity(quantity),
    minQuantity: new Quantity(minQuantity),
  });

describe('StockLevel', () => {
  it('desconta o reservado do estoque físico', () => {
    const level = new StockLevel(buildPart(20, 5), 8);
    expect(level.availableQuantity).toBe(12);
  });

  it('mantém o estoque físico quando não há reserva', () => {
    const level = new StockLevel(buildPart(20, 5), 0);
    expect(level.availableQuantity).toBe(20);
  });

  it('reporta abaixo do mínimo pelo estoque lógico, não pelo físico', () => {
    const level = new StockLevel(buildPart(20, 15), 8);

    expect(level.part.isBelowMinimum()).toBe(false);
    expect(level.availableQuantity).toBe(12);
    expect(level.isBelowMinimum()).toBe(true);
  });

  it('não reporta abaixo do mínimo quando o lógico ainda cobre o mínimo', () => {
    const level = new StockLevel(buildPart(20, 10), 5);

    expect(level.availableQuantity).toBe(15);
    expect(level.isBelowMinimum()).toBe(false);
  });

  it('não considera abaixo do mínimo quando o lógico é igual ao mínimo', () => {
    const level = new StockLevel(buildPart(20, 12), 8);

    expect(level.availableQuantity).toBe(12);
    expect(level.isBelowMinimum()).toBe(false);
  });

  it('permite estoque lógico negativo quando há mais reservado do que em estoque', () => {
    const level = new StockLevel(buildPart(5, 10), 12);

    expect(level.availableQuantity).toBe(-7);
    expect(level.isBelowMinimum()).toBe(true);
  });

  it('nunca reporta abaixo do mínimo quando o mínimo é zero e não há reserva', () => {
    const level = new StockLevel(buildPart(0, 0), 0);
    expect(level.isBelowMinimum()).toBe(false);
  });
});
