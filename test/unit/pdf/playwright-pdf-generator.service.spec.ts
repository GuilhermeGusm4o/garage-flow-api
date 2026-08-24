import { PlaywrightPdfGenerator } from '@infra/pdf/playwright-pdf-generator.service';

jest.setTimeout(30_000);

describe('PlaywrightPdfGenerator', () => {
  let generator: PlaywrightPdfGenerator;

  beforeAll(async () => {
    generator = new PlaywrightPdfGenerator();
    await generator.onModuleInit();
  });

  afterAll(async () => {
    await generator.onModuleDestroy();
  });

  it('deve renderizar um HTML simples e retornar um Buffer de PDF válido', async () => {
    const pdf = await generator.generate('<html><body><h1>Orçamento de teste</h1></body></html>');

    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.subarray(0, 5).toString('utf-8')).toBe('%PDF-');
  });
});
