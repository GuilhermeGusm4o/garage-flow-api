import { type Part } from '@inventory/domain/entities/part.entity';

export abstract class PartRepository {
  abstract save(part: Part): Promise<void>;
  abstract findById(id: string): Promise<Part | null>;
  abstract findAll(): Promise<Part[]>;
  abstract findByIdList(idList: string[]): Promise<Part[]>;
  abstract findBelowMinimum(): Promise<Part[]>;
  abstract softDelete(id: string): Promise<void>;
}
