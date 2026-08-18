import { Test, type TestingModule } from '@nestjs/testing';

import { AuthController } from '@auth/presentation/auth.controller';

import { CreateUserUseCase } from '@auth/application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from '@auth/application/use-cases/delete-user.use-case';
import { GetUserByEmailUseCase } from '@auth/application/use-cases/get-user-by-email.use-case';
import { ListUsersUseCase } from '@auth/application/use-cases/list-users.use-case';
import { LoginUseCase } from '@auth/application/use-cases/login-user.use-case';
import { UpdateUserUseCase } from '@auth/application/use-cases/update-user.use-case';

import { type CreateUserDto } from '@auth/presentation/dto/create-user.dto';
import { type LoginDto } from '@auth/presentation/dto/login-user.dto';
import { type UpdateUserDto } from '@auth/presentation/dto/update-user.dto';

describe('AuthController', () => {
  let controller: AuthController;

  let createUserUseCase: {
    execute: jest.Mock;
  };

  let updateUserUseCase: {
    execute: jest.Mock;
  };

  let deleteUserUseCase: {
    execute: jest.Mock;
  };

  let loginUseCase: {
    execute: jest.Mock;
  };

  let listUsersUseCase: {
    execute: jest.Mock;
  };

  let getUserByEmailUseCase: {
    execute: jest.Mock;
  };

  beforeEach(async () => {
    createUserUseCase = {
      execute: jest.fn(),
    };

    updateUserUseCase = {
      execute: jest.fn(),
    };

    deleteUserUseCase = {
      execute: jest.fn(),
    };

    loginUseCase = {
      execute: jest.fn(),
    };

    listUsersUseCase = {
      execute: jest.fn(),
    };

    getUserByEmailUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: CreateUserUseCase,
          useValue: createUserUseCase,
        },
        {
          provide: UpdateUserUseCase,
          useValue: updateUserUseCase,
        },
        {
          provide: DeleteUserUseCase,
          useValue: deleteUserUseCase,
        },
        {
          provide: LoginUseCase,
          useValue: loginUseCase,
        },
        {
          provide: ListUsersUseCase,
          useValue: listUsersUseCase,
        },
        {
          provide: GetUserByEmailUseCase,
          useValue: getUserByEmailUseCase,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('listUsers', () => {
    it('should list users', async () => {
      const users = [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'ADMIN',
        },
        {
          id: 'user-2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          role: 'MECHANIC',
        },
      ];

      listUsersUseCase.execute.mockResolvedValue(users);

      const result = await controller.listUsers();

      expect(listUsersUseCase.execute).toHaveBeenCalledTimes(1);
      expect(listUsersUseCase.execute).toHaveBeenCalledWith();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(result[1]).toMatchObject({
        id: 'user-2',
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
    });
  });

  describe('getUserByEmail', () => {
    it('should get a user by email', async () => {
      const email = 'john@example.com';

      const user = {
        id: 'user-1',
        name: 'John Doe',
        email,
        role: 'ADMIN',
      };

      getUserByEmailUseCase.execute.mockResolvedValue(user);

      const result = await controller.getUserByEmail(email);

      expect(getUserByEmailUseCase.execute).toHaveBeenCalledTimes(1);
      expect(getUserByEmailUseCase.execute).toHaveBeenCalledWith(email);

      expect(result).toMatchObject({
        id: 'user-1',
        name: 'John Doe',
        email,
      });
    });
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'MECHANIC',
      } as CreateUserDto;

      const user = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'MECHANIC',
      };

      createUserUseCase.execute.mockResolvedValue(user);

      const result = await controller.createUser(dto);

      expect(createUserUseCase.execute).toHaveBeenCalledTimes(1);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(dto);

      expect(result).toMatchObject({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });

  describe('login', () => {
    it('should login the user and return the access token', async () => {
      const dto = {
        email: 'john@example.com',
        password: 'password123',
      } as LoginDto;

      const user = {
        id: 'user-1',
        name: 'John Doe',
        email: dto.email,
        role: 'MECHANIC',
      };

      loginUseCase.execute.mockResolvedValue({
        access_token: 'jwt-token',
        user,
      });

      const result = await controller.login(dto);

      expect(loginUseCase.execute).toHaveBeenCalledTimes(1);
      expect(loginUseCase.execute).toHaveBeenCalledWith({
        email: dto.email,
        password: dto.password,
      });

      expect(result).toMatchObject({
        access_token: 'jwt-token',
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const id = 'user-1';

      const dto = {
        name: 'John Updated',
        email: 'john.updated@example.com',
      } as UpdateUserDto;

      const user = {
        id,
        name: 'John Updated',
        email: 'john.updated@example.com',
        role: 'MECHANIC',
      };

      updateUserUseCase.execute.mockResolvedValue(user);

      const result = await controller.updateUser(id, dto);

      expect(updateUserUseCase.execute).toHaveBeenCalledTimes(1);
      expect(updateUserUseCase.execute).toHaveBeenCalledWith({
        id,
        ...dto,
      });

      expect(result).toMatchObject({
        id,
        name: 'John Updated',
        email: 'john.updated@example.com',
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const id = 'user-1';

      deleteUserUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.deleteUser(id);

      expect(deleteUserUseCase.execute).toHaveBeenCalledTimes(1);
      expect(deleteUserUseCase.execute).toHaveBeenCalledWith(id);

      expect(result).toBeUndefined();
    });
  });
});
