import { CalculateTotalAmountUseCase } from '@service-orders/application/use-cases/calculate-total-amount.use-case';
import { ServiceItem } from '@service-orders/domain/entities/service-item.entity';
import { PartItem } from '@service-orders/domain/entities/part-item.entity';
import { type FindServicesByIdListUseCase } from '@service/application/use-cases/find-services-by-id-list.use-case';

describe('CalculateTotalAmountUseCase', () => {
  let findServicesByIdList: { execute: jest.Mock };
  let useCase: CalculateTotalAmountUseCase;

  beforeEach(() => {
    findServicesByIdList = { execute: jest.fn() };
    useCase = new CalculateTotalAmountUseCase(
      findServicesByIdList as unknown as FindServicesByIdListUseCase,
    );
  });

  it('deve somar o preço do ServiceItem com o preço atual do Service associado', async () => {
    findServicesByIdList.execute.mockResolvedValue([
      { id: 'service-1', price: { getValue: () => 120 } },
    ]);
    const serviceItems = [new ServiceItem(null, 'service-1', 100)];

    const total = await useCase.execute(serviceItems, []);

    expect(findServicesByIdList.execute).toHaveBeenCalledWith(['service-1']);
    expect(total).toBe(220); // 100 (ServiceItem) + 120 (Service atual)
  });

  it('deve somar peças ao total (quantidade * preço unitário)', async () => {
    findServicesByIdList.execute.mockResolvedValue([
      { id: 'service-1', price: { getValue: () => 100 } },
    ]);
    const serviceItems = [new ServiceItem(null, 'service-1', 100)];
    const partItems = [new PartItem(null, 'part-1', 2, 30)];

    const total = await useCase.execute(serviceItems, partItems);

    expect(total).toBe(260); // 100 + 100 (serviços) + 60 (peças)
  });

  it('não deve consultar serviços quando não houver ServiceItem', async () => {
    const total = await useCase.execute([], [new PartItem(null, 'part-1', 1, 10)]);

    expect(findServicesByIdList.execute).not.toHaveBeenCalled();
    expect(total).toBe(10);
  });
});
