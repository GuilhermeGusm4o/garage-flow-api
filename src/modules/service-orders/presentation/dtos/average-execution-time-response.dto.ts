import { ApiProperty } from '@nestjs/swagger';

export class AverageExecutionTimeResponseDto {
  @ApiProperty({ example: 127.3 })
  averageExecutionTimeMinutes!: number;

  @ApiProperty({ example: '2h 7min' })
  averageExecutionTimeFormatted!: string;

  @ApiProperty({ example: 35 })
  completedServiceOrders!: number;
}
