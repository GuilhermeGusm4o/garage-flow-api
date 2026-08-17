import { FIXED_DATE, makeClient } from '../../client.factory';

describe('ClientEntity', () => {
  it('normaliza email ausente para null', () => {
    expect(makeClient({ email: null }).email).toBeNull();
  });

  it('nasce sem deletedAt', () => {
    const client = makeClient();

    expect(client.deletedAt).toBeNull();
    expect(client.isDeleted).toBe(false);
  });

  describe('update', () => {
    it('altera apenas os campos informados e atualiza updatedAt', () => {
      const client = makeClient();

      client.update({ name: 'Maria Souza' });

      expect(client.name).toBe('Maria Souza');
      expect(client.phone).toBe('11999998888');
      expect(client.address).toBe('Rua das Flores, 123');
      expect(client.updatedAt.getTime()).toBeGreaterThan(FIXED_DATE.getTime());
      expect(client.createdAt).toEqual(FIXED_DATE);
    });

    it('ignora campos undefined', () => {
      const client = makeClient();

      client.update({ name: undefined, phone: undefined });

      expect(client.name).toBe('João da Silva');
      expect(client.phone).toBe('11999998888');
    });

    it('permite limpar o email passando null explicitamente', () => {
      const client = makeClient();

      client.update({ email: null });

      expect(client.email).toBeNull();
    });

    it('não expõe forma de trocar o documento', () => {
      const client = makeClient();

      client.update({ name: 'Maria Souza' });

      expect(client.cpfCnpj.value).toBe('52998224725');
    });
  });

  describe('softDelete', () => {
    it('marca deletedAt e atualiza updatedAt', () => {
      const client = makeClient();

      client.softDelete();

      expect(client.isDeleted).toBe(true);
      expect(client.deletedAt).toBeInstanceOf(Date);
      expect(client.updatedAt.getTime()).toBeGreaterThan(FIXED_DATE.getTime());
    });
  });
});
