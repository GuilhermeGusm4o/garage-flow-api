import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AverageExecutionTimeQueryDto } from '@service-orders/presentation/dtos/average-execution-time-query.dto';

describe('AverageExecutionTimeQueryDto', () => {
  it('converte uma data YYYY-MM-DD válida em Date', async () => {
    const dto = plainToInstance(AverageExecutionTimeQueryDto, {
      from: '2026-08-01',
      to: '2026-08-31',
    });

    expect(dto.from).toEqual(new Date('2026-08-01T00:00:00.000Z'));
    expect(dto.to).toEqual(new Date('2026-08-31T00:00:00.000Z'));
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('mantém o valor original quando não é uma string no formato YYYY-MM-DD', async () => {
    const dto = plainToInstance(AverageExecutionTimeQueryDto, { from: 12345 });

    expect(dto.from).toBe(12345);
    const errors = await validate(dto);
    expect(errors[0]?.property).toBe('from');
  });

  it('rejeita uma data calendarmente inválida que passa no regex', async () => {
    const dto = plainToInstance(AverageExecutionTimeQueryDto, { from: '2026-02-30' });

    expect(Number.isNaN(dto.from?.getTime())).toBe(true);
    const errors = await validate(dto);
    expect(errors[0]?.property).toBe('from');
  });

  it('aceita ausência dos filtros por serem opcionais', async () => {
    const dto = plainToInstance(AverageExecutionTimeQueryDto, {});

    expect(dto.from).toBeUndefined();
    expect(dto.to).toBeUndefined();
    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});
