import { DomainError } from '@common/errors/domain.error';

export class UnitOfMeasure {
  private static readonly VALID_VALUES = ['ML', 'G', 'KG', 'UNIT'];

  constructor(public readonly value: string) {
    if (!UnitOfMeasure.VALID_VALUES.includes(value)) {
      throw new DomainError(`Unidade de medida inválida: ${value}`);
    }
  }

  toJSON() {
    return this.value;
  }
}
