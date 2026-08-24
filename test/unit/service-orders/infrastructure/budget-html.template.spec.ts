import {
  buildServiceOrderBudgetHtml,
  type ServiceOrderBudgetViewModel,
} from '@service-orders/infrastructure/pdf/budget-html.template';

const currency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

describe('buildServiceOrderBudgetHtml', () => {
  const buildViewModel = (
    overrides: Partial<ServiceOrderBudgetViewModel> = {},
  ): ServiceOrderBudgetViewModel => ({
    serviceOrderId: 'os-1',
    description: 'Ruído no motor',
    status: 'AWAITING_APPROVAL',
    client: {
      name: 'João da Silva',
      cpfCnpj: '529.982.247-25',
      phone: '11999998888',
      address: 'Rua das Flores, 123',
      email: 'joao@email.com',
    },
    vehicle: {
      brand: 'Volkswagen',
      model: 'Gol',
      licensePlate: 'ABC1D23',
      year: 2020,
    },
    services: [{ name: 'Troca de óleo', quantity: 1, unitOfMeasure: null, unitPrice: 100, subtotal: 100 }],
    parts: [
      { name: 'Filtro de óleo', quantity: 2, unitOfMeasure: 'UNIT', unitPrice: 30, subtotal: 60 },
    ],
    totalAmount: 160,
    generatedAt: new Date('2026-01-01T10:00:00.000Z'),
    ...overrides,
  });

  it('deve incluir os dados do cliente e do veículo', () => {
    const html = buildServiceOrderBudgetHtml(buildViewModel());

    expect(html).toContain('João da Silva');
    expect(html).toContain('529.982.247-25');
    expect(html).toContain('Volkswagen');
    expect(html).toContain('ABC1D23');
  });

  it('deve incluir cada serviço e peça com seus valores', () => {
    const html = buildServiceOrderBudgetHtml(buildViewModel());

    expect(html).toContain('Troca de óleo');
    expect(html).toContain('Filtro de óleo');
    expect(html).toContain(currency(100));
    expect(html).toContain(currency(60));
  });

  it('deve incluir o valor total formatado', () => {
    const html = buildServiceOrderBudgetHtml(buildViewModel());

    expect(html).toContain(currency(160));
  });

  it('não deve renderizar a tabela de serviços quando não houver serviços', () => {
    const html = buildServiceOrderBudgetHtml(buildViewModel({ services: [] }));

    expect(html).not.toContain('<h2>Serviços</h2>');
  });

  it('deve escapar caracteres HTML nos dados do cliente', () => {
    const html = buildServiceOrderBudgetHtml(
      buildViewModel({
        client: {
          name: '<script>alert(1)</script>',
          cpfCnpj: '529.982.247-25',
          phone: '11999998888',
          address: 'Rua das Flores, 123',
          email: null,
        },
      }),
    );

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
