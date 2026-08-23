import { Quantity } from '@inventory/domain/value-objects/quantity.vo';
import { makePart } from '../../part.factory';

describe('Part', () => {
  const buildPart = (quantity = 10) => makePart({ id: 'part-1', quantity: new Quantity(quantity) });

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

  it('deve reportar abaixo do mínimo quando a quantidade estiver abaixo do limite fixo', () => {
    const part = buildPart(2);
    expect(part.isBelowMinimum()).toBe(true);
  });

  it('deve reportar não abaixo do mínimo quando a quantidade estiver acima do limite', () => {
    const part = buildPart(10);
    expect(part.isBelowMinimum()).toBe(false);
  });

  it('deve bumpar updatedAt ao repor estoque, consumir ou atualizar dados', () => {
    const part = buildPart(10);
    const before = part.updatedAt;

    part.restock(5);

    expect(part.updatedAt.getTime()).toBeGreaterThan(before.getTime());
  });

  it('deve marcar como excluído ao chamar softDelete', () => {
    const part = buildPart(10);
    expect(part.isDeleted).toBe(false);

    part.softDelete();

    expect(part.isDeleted).toBe(true);
    expect(part.deletedAt).toBeInstanceOf(Date);
  });
});
