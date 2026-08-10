import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Verifica a disponibilidade da API',
  })
  @ApiOkResponse({
    description: 'API está funcionando normalmente.',
  })
  check() {
    return this.healthService.check();
  }
}
