import { type Part } from '@inventory/domain/entities/part.entity';

/**
 * Posição de estoque de uma peça: o que existe fisicamente, o que já está
 * comprometido com ordens de serviço em aberto, e a diferença entre os dois
 * (o "estoque lógico", que é o realmente disponível para novas OS).
 */
export class StockLevel {
  constructor(
    public readonly part: Part,
    public readonly reservedQuantity: number,
  ) {}

  /** Estoque lógico. Pode ser negativo quando há mais peça comprometida do que em estoque. */
  get availableQuantity(): number {
    return this.part.quantity.value - this.reservedQuantity;
  }

  isBelowMinimum(): boolean {
    return this.availableQuantity < this.part.minQuantity.value;
  }
}
