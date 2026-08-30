import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 404 })
  statusCode!: number;

  @ApiProperty({
    description:
      'A single error message, or an array of validation messages when request-body validation fails.',
    example: 'Client not found',
  })
  message!: string | string[];

  @ApiProperty({ description: 'When the error occurred (ISO 8601)', example: '2026-08-30T12:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({
    description: 'The request path that produced the error',
    example: '/clients/123e4567-e89b-12d3-a456-426614174000',
  })
  path!: string;
}
