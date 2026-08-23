export class PartItem {
  constructor(
    public readonly id: string | null,
    public readonly inventoryId: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
    public readonly unitOfMeasure: string | null = null,
  ) {}
}
