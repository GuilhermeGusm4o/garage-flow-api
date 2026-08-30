import { BadRequestException } from '@nestjs/common';
import { ParseEmailPipe } from '@common/pipes/parse-email.pipe';

describe('ParseEmailPipe', () => {
  const pipe = new ParseEmailPipe();

  it('devolve o valor quando é um e-mail válido', () => {
    expect(pipe.transform('user@example.com')).toBe('user@example.com');
  });

  it('lança BadRequestException quando o valor não é um e-mail válido', () => {
    expect(() => pipe.transform('not-an-email')).toThrow(BadRequestException);
  });
});
