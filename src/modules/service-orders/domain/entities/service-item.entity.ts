export class ServiceItem {
  constructor(
    public readonly id: string | null,
    public readonly serviceId: string,
    public readonly price: number,
  ) {}
}
