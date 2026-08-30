import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

const parseDateOnly = ({ value }: { value: unknown }): Date | unknown => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? date
    : new Date(Number.NaN);
};

export class AverageExecutionTimeQueryDto {
  @ApiPropertyOptional({
    description: 'Start date (inclusive), format YYYY-MM-DD',
    example: '2026-08-01',
  })
  @IsOptional()
  @Transform(parseDateOnly)
  @IsDate()
  from?: Date;

  @ApiPropertyOptional({
    description: 'End date (exclusive), format YYYY-MM-DD',
    example: '2026-08-31',
  })
  @IsOptional()
  @Transform(parseDateOnly)
  @IsDate()
  to?: Date;
}
