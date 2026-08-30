import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaService } from '@infra/database/prisma/prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue({ $connect: jest.fn(), onModuleInit: jest.fn() })
      .compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
