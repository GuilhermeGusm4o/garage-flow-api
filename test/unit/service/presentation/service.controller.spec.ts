import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { ServiceController } from '@service/presentation/service.controller';
import { CreateServiceUseCase } from '@service/application/use-cases/create-service.use-case';
import { FindAllServicesUseCase } from '@service/application/use-cases/find-all-services.use-case';
import { FindServiceByIdUseCase } from '@service/application/use-cases/find-service-by-id.use-case';
import { UpdateServiceUseCase } from '@service/application/use-cases/update-service.use-case';
import { DeleteServiceUseCase } from '@service/application/use-cases/delete-service.use-case';
import { ServiceEntity } from '@service/domain/entities/service.entity';
import { ServicePrice } from '@service/domain/value-objects/service-price.value-object';
import { type UUID } from 'crypto';

const mockId = '123e4567-e89b-12d3-a456-426614174000' as UUID;

const makeService = (): ServiceEntity =>
  ServiceEntity.create({
    id: mockId,
    name: 'Troca de óleo',
    price: ServicePrice.create(150),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  });

describe('ServiceController', () => {
  let controller: ServiceController;
  let createUseCase: jest.Mocked<CreateServiceUseCase>;
  let findAllUseCase: jest.Mocked<FindAllServicesUseCase>;
  let findByIdUseCase: jest.Mocked<FindServiceByIdUseCase>;
  let updateUseCase: jest.Mocked<UpdateServiceUseCase>;
  let deleteUseCase: jest.Mocked<DeleteServiceUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceController],
      providers: [
        { provide: CreateServiceUseCase, useValue: { execute: jest.fn() } },
        { provide: FindAllServicesUseCase, useValue: { execute: jest.fn() } },
        { provide: FindServiceByIdUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateServiceUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteServiceUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ServiceController>(ServiceController);
    createUseCase = module.get(CreateServiceUseCase);
    findAllUseCase = module.get(FindAllServicesUseCase);
    findByIdUseCase = module.get(FindServiceByIdUseCase);
    updateUseCase = module.get(UpdateServiceUseCase);
    deleteUseCase = module.get(DeleteServiceUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return a ServiceResponse', async () => {
      createUseCase.execute.mockResolvedValue(makeService());
      const result = await controller.create({ name: 'Troca de óleo', price: 150 });
      expect(result.name).toBe('Troca de óleo');
      expect(result.price).toBe('150.00');
    });
  });

  describe('findAll', () => {
    it('should return an array of ServiceResponse', async () => {
      findAllUseCase.execute.mockResolvedValue([makeService()]);
      const result = await controller.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockId);
    });
  });

  describe('findOne', () => {
    it('should return a ServiceResponse by id', async () => {
      findByIdUseCase.execute.mockResolvedValue(makeService());
      const result = await controller.findOne(mockId);
      expect(result.id).toBe(mockId);
    });

    it('should throw NotFoundException when not found', async () => {
      findByIdUseCase.execute.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne(mockId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should return updated ServiceResponse', async () => {
      const updated = makeService();
      updated.update('Alinhamento', ServicePrice.create(200));
      updateUseCase.execute.mockResolvedValue(updated);

      const result = await controller.update(mockId, { name: 'Alinhamento', price: 200 });
      expect(result.name).toBe('Alinhamento');
    });
  });

  describe('remove', () => {
    it('should call delete use case', async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);
      await controller.remove(mockId);
      expect(deleteUseCase.execute).toHaveBeenCalledWith(mockId);
    });

    it('should throw NotFoundException when not found', async () => {
      deleteUseCase.execute.mockRejectedValue(new NotFoundException());
      await expect(controller.remove(mockId)).rejects.toThrow(NotFoundException);
    });
  });
});
