import { type Client as ClientModel } from '@generated/prisma/client';
import { ClientMapper } from '@client/infrastructure/client.mapper';
import { FIXED_DATE, makeClient } from '../client.factory';

const raw: ClientModel = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  cpfCnpj: '52998224725',
  name: 'João da Silva',
  address: 'Rua das Flores, 123',
  phone: '11999998888',
  email: 'joao@email.com',
  created_at: FIXED_DATE,
  updated_at: FIXED_DATE,
  deleted_at: null,
};

describe('ClientMapper', () => {
  describe('toDomain', () => {
    it('monta a entidade a partir do registro do Prisma', () => {
      const client = ClientMapper.toDomain(raw);

      expect(client.id).toBe(raw.id);
      expect(client.cpfCnpj.value).toBe('52998224725');
      expect(client.cpfCnpj.type).toBe('CPF');
      expect(client.name).toBe(raw.name);
      expect(client.address).toBe(raw.address);
      expect(client.phone).toBe(raw.phone);
      expect(client.email).toBe(raw.email);
      expect(client.createdAt).toEqual(FIXED_DATE);
      expect(client.updatedAt).toEqual(FIXED_DATE);
      expect(client.deletedAt).toBeNull();
    });

    it('aceita email nulo', () => {
      expect(ClientMapper.toDomain({ ...raw, email: null }).email).toBeNull();
    });

    it('propaga deleted_at', () => {
      const client = ClientMapper.toDomain({ ...raw, deleted_at: FIXED_DATE });

      expect(client.isDeleted).toBe(true);
    });
  });

  describe('toPrisma', () => {
    it('grava o documento apenas com dígitos, sem máscara', () => {
      const client = makeClient({ cpfCnpj: '529.982.247-25' });

      expect(ClientMapper.toPrisma(client).cpfCnpj).toBe('52998224725');
    });

    it('não envia created_at nem updated_at (controlados pelo banco)', () => {
      const data = ClientMapper.toPrisma(makeClient());

      expect(data).not.toHaveProperty('created_at');
      expect(data).not.toHaveProperty('updated_at');
      expect(Object.keys(data).sort()).toEqual(
        ['address', 'cpfCnpj', 'deleted_at', 'email', 'id', 'name', 'phone'].sort(),
      );
    });

    it('faz round trip sem perder dados', () => {
      const roundTripped = ClientMapper.toDomain({
        ...ClientMapper.toPrisma(ClientMapper.toDomain(raw)),
        created_at: FIXED_DATE,
        updated_at: FIXED_DATE,
      });

      expect(roundTripped.cpfCnpj.value).toBe(raw.cpfCnpj);
      expect(roundTripped.name).toBe(raw.name);
      expect(roundTripped.email).toBe(raw.email);
      expect(roundTripped.deletedAt).toBeNull();
    });
  });
});
