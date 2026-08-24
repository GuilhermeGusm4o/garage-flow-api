import { type Part } from '@inventory/domain/entities/part.entity';

export abstract class PartRepository {
  abstract save(part: Part): Promise<void>;
  abstract findById(id: string): Promise<Part | null>;
  abstract findAll(): Promise<Part[]>;
  abstract softDelete(id: string): Promise<void>;
  abstract findReservedQuantities(serviceOrderStatuses: string[]): Promise<Map<string, number>>;

  /** Quantidade já comprometida de uma única peça, nos mesmos termos acima. */
  abstract findReservedQuantityForPart(
    partId: string,
    serviceOrderStatuses: string[],
  ): Promise<number>;
}
