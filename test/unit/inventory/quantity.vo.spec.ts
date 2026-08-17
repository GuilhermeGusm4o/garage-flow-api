import { Quantity } from '../../../src/inventory/domain/value-objects/quantity.vo';

describe('Quantity', () => {
  it('não deve permitir valores negativos na criação', () => {
    expect(() => new Quantity(-1)).toThrow('Quantidade não pode ser negativa');
  });

  it('deve adicionar corretamente', () => {
    const qty = new Quantity(10);
    expect(qty.add(5).value).toBe(15);
  });

  it('deve subtrair corretamente', () => {
    const qty = new Quantity(10);
    expect(qty.subtract(4).value).toBe(6);
  });

  it('deve lançar um erro ao subtrair mais do que o disponível', () => {
    const qty = new Quantity(5);
    expect(() => qty.subtract(10)).toThrow('Estoque insuficiente');
  });
});
