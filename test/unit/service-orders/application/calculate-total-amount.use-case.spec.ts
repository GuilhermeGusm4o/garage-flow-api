import { CalculateTotalAmountUseCase } from '@service-orders/application/use-cases/calculate-total-amount.use-case';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';

describe('CalculateTotalAmountUseCase', () => {
  let useCase: CalculateTotalAmountUseCase;

  beforeEach(() => {
    useCase = new CalculateTotalAmountUseCase();
  });

  it('deve somar o preço total de cada ServiceItem', async () => {
    const serviceItems = [ServiceItem.create('service-1', 100)];

    const total = await useCase.execute(serviceItems, []);

    expect(total).toBe(100);
  });

  it('deve somar peças ao total (quantidade * preço unitário)', async () => {
    const serviceItems = [ServiceItem.create('service-1', 100)];
    const partItems = [PartItem.create('part-1', 2, 30)];

    const total = await useCase.execute(serviceItems, partItems);

    expect(total).toBe(160); // 100 (serviço) + 60 (peças)
  });

  it('deve retornar 0 quando não houver ServiceItem nem PartItem', async () => {
    const total = await useCase.execute([], []);

    expect(total).toBe(0);
  });
});
