import { Test, type TestingModule } from '@nestjs/testing';
import { HealthController } from '../../../src/infra/health/health.controller';
import { HealthService } from '../../../src/infra/health/health.service';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            check: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
