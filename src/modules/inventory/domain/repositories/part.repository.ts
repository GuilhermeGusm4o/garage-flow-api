import { type Part } from '@inventory/domain/entities/part.entity';

export abstract class PartRepository {
  abstract save(part: Part): Promise<void>;
  abstract findById(id: string): Promise<Part | null>;
  abstract findByIds(ids: string[]): Promise<Part[]>;
  abstract findAll(): Promise<Part[]>;
  abstract findByIdList(idList: string[]): Promise<Part[]>;
  abstract findBelowMinimum(): Promise<Part[]>;
  abstract softDelete(id: string): Promise<void>;

  /**
   * Soma, por peça, a quantidade já comprometida com ordens de serviço nos status
   * informados. Sem `partIds`, cobre todo o estoque. Peças sem reserva não aparecem no mapa.
   */
  abstract findReservedQuantities(
    serviceOrderStatuses: string[],
    partIds?: string[],
  ): Promise<Map<string, number>>;
}
