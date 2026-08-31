import { ApiProperty } from '@nestjs/swagger';

export class AverageExecutionTimeResponseDto {
  @ApiProperty({
    description: 'Average execution time, in minutes',
    example: 127.3,
  })
  averageExecutionTimeMinutes!: number;

  @ApiProperty({
    description: 'Average execution time, formatted for display',
    example: '2h 7min',
  })
  averageExecutionTimeFormatted!: string;

  @ApiProperty({ description: 'Number of completed service orders considered', example: 35 })
  completedServiceOrders!: number;
}
