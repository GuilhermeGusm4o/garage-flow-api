import { CpfCnpj, InvalidCpfCnpjError } from '@client/domain/value-objects/cpf-cnpj-validator.vo';

describe('CpfCnpj', () => {
  describe('CPF', () => {
    it('aceita um CPF válido sem máscara', () => {
      const document = CpfCnpj.create('52998224725');

      expect(document.value).toBe('52998224725');
      expect(document.type).toBe('CPF');
      expect(document.isCpf()).toBe(true);
    });

    it('aceita um CPF válido com máscara e guarda só os dígitos', () => {
      expect(CpfCnpj.create('529.982.247-25').value).toBe('52998224725');
    });

    it('rejeita CPF com dígito verificador errado', () => {
      expect(() => CpfCnpj.create('52998224724')).toThrow(InvalidCpfCnpjError);
    });

    it('rejeita CPF com todos os dígitos iguais', () => {
      expect(() => CpfCnpj.create('11111111111')).toThrow(InvalidCpfCnpjError);
    });

    it('formata para exibição', () => {
      expect(CpfCnpj.create('52998224725').format()).toBe('529.982.247-25');
    });
  });

  describe('CNPJ', () => {
    it('aceita um CNPJ válido sem máscara', () => {
      const document = CpfCnpj.create('11222333000181');

      expect(document.value).toBe('11222333000181');
      expect(document.type).toBe('CNPJ');
      expect(document.isCnpj()).toBe(true);
    });

    it('aceita um CNPJ válido com máscara', () => {
      expect(CpfCnpj.create('11.222.333/0001-81').value).toBe('11222333000181');
    });

    it('rejeita CNPJ com dígito verificador errado', () => {
      expect(() => CpfCnpj.create('11222333000182')).toThrow(InvalidCpfCnpjError);
    });

    it('rejeita CNPJ com todos os dígitos iguais', () => {
      expect(() => CpfCnpj.create('00000000000000')).toThrow(InvalidCpfCnpjError);
    });

    it('formata para exibição', () => {
      expect(CpfCnpj.create('11222333000181').format()).toBe('11.222.333/0001-81');
    });
  });

  describe('entradas inválidas', () => {
    it.each(['', '   ', 'abc', '123', '5299822472', '529982247250'])(
      'rejeita "%s"',
      (input: string) => {
        expect(CpfCnpj.isValid(input)).toBe(false);
      },
    );
  });

  it('compara pelo valor', () => {
    expect(CpfCnpj.create('529.982.247-25').equals(CpfCnpj.create('52998224725'))).toBe(true);
    expect(CpfCnpj.create('52998224725').equals(CpfCnpj.create('11222333000181'))).toBe(false);
  });
});
