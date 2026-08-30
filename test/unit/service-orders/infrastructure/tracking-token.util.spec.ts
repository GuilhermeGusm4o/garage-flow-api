import {
  generateTrackingToken,
  resolveTrackingToken,
  buildTrackingLink,
  InvalidTrackingTokenError,
} from '@service-orders/infrastructure/security/tracking-token.util';

describe('tracking-token.util', () => {
  const originalSecret = process.env.TRACKING_TOKEN_SECRET;

  beforeEach(() => {
    process.env.TRACKING_TOKEN_SECRET = 'test-secret';
  });

  afterAll(() => {
    process.env.TRACKING_TOKEN_SECRET = originalSecret;
  });

  it('deve gerar um token que resolve de volta para o id original', () => {
    const serviceOrderId = '123e4567-e89b-12d3-a456-426614174000';

    const token = generateTrackingToken(serviceOrderId);

    expect(resolveTrackingToken(token)).toBe(serviceOrderId);
  });

  it('deve gerar tokens diferentes para o mesmo id em chamadas distintas', () => {
    const serviceOrderId = '123e4567-e89b-12d3-a456-426614174000';

    const tokenA = generateTrackingToken(serviceOrderId);
    const tokenB = generateTrackingToken(serviceOrderId);

    expect(tokenA).not.toBe(tokenB);
    expect(resolveTrackingToken(tokenA)).toBe(serviceOrderId);
    expect(resolveTrackingToken(tokenB)).toBe(serviceOrderId);
  });

  it('não deve conter o id da OS em texto plano no token', () => {
    const serviceOrderId = '123e4567-e89b-12d3-a456-426614174000';

    const token = generateTrackingToken(serviceOrderId);

    expect(token).not.toContain(serviceOrderId);
  });

  it('deve lançar InvalidTrackingTokenError para um token malformado', () => {
    expect(() => resolveTrackingToken('not-a-valid-token')).toThrow(InvalidTrackingTokenError);
  });

  it('deve lançar InvalidTrackingTokenError para um token gerado com outra chave', () => {
    const serviceOrderId = '123e4567-e89b-12d3-a456-426614174000';
    const token = generateTrackingToken(serviceOrderId);

    process.env.TRACKING_TOKEN_SECRET = 'another-secret';

    expect(() => resolveTrackingToken(token)).toThrow(InvalidTrackingTokenError);
  });

  it('deve lançar erro ao gerar token sem TRACKING_TOKEN_SECRET configurado', () => {
    delete process.env.TRACKING_TOKEN_SECRET;

    expect(() => generateTrackingToken('123e4567-e89b-12d3-a456-426614174000')).toThrow(
      'TRACKING_TOKEN_SECRET is not defined',
    );
  });

  it('buildTrackingLink deve montar um link absoluto sob o baseUrl informado', () => {
    const serviceOrderId = '123e4567-e89b-12d3-a456-426614174000';

    const link = buildTrackingLink('https://garage-flow.example.com', serviceOrderId);

    expect(link).toMatch(/^https:\/\/garage-flow\.example\.com\/service-orders\/track\/.+/);
    const token = link.split('/service-orders/track/')[1];
    expect(resolveTrackingToken(token)).toBe(serviceOrderId);
  });
});
