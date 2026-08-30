import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from './health-response.dto';
import { HealthService } from './health.service';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Checks API availability',
  })
  @ApiOkResponse({
    type: HealthResponseDto,
    description: 'The API is running normally',
  })
  check(): HealthResponseDto {
    return this.healthService.check();
  }
}
