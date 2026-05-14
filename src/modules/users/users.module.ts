import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { FindUserByEmailUseCase } from './application/use-cases/find-user-by-email.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { FindAllUsersUseCase } from './application/use-cases/find-all-users.use-case';
import { ChangeUserRoleUseCase } from './application/use-cases/change-user-role.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { SoftDeleteUserUseCase } from './application/use-cases/soft-delete-user.use-case';
import type { UserRepository } from './domain/interfaces/user.repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { UsersController } from './infrastructure/users.controller';
import { RolesGuard } from '../auth/infrastructure/guards/roles.guard';
import {
  USER_REPOSITORY,
  CHANGE_USER_ROLE_USE_CASE,
  FIND_ALL_USERS_USE_CASE,
  UPDATE_USER_USE_CASE,
  SOFT_DELETE_USER_USE_CASE,
} from './users.tokens';

const createUserUseCaseProvider = {
  provide: CreateUserUseCase,
  useFactory: (userRepository: UserRepository): CreateUserUseCase =>
    new CreateUserUseCase(userRepository),
  inject: [USER_REPOSITORY],
};

const findUserByEmailUseCaseProvider = {
  provide: FindUserByEmailUseCase,
  useFactory: (userRepository: UserRepository): FindUserByEmailUseCase =>
    new FindUserByEmailUseCase(userRepository),
  inject: [USER_REPOSITORY],
};

const findUserByIdUseCaseProvider = {
  provide: FindUserByIdUseCase,
  useFactory: (userRepository: UserRepository): FindUserByIdUseCase =>
    new FindUserByIdUseCase(userRepository),
  inject: [USER_REPOSITORY],
};

const findAllUsersUseCaseProvider = {
  provide: FIND_ALL_USERS_USE_CASE,
  useFactory: (userRepository: UserRepository): FindAllUsersUseCase =>
    new FindAllUsersUseCase(userRepository),
  inject: [USER_REPOSITORY],
};

const changeUserRoleUseCaseProvider = {
  provide: CHANGE_USER_ROLE_USE_CASE,
  useFactory: (userRepository: UserRepository): ChangeUserRoleUseCase =>
    new ChangeUserRoleUseCase(userRepository),
  inject: [USER_REPOSITORY],
};

const updateUserUseCaseProvider = {
  provide: UPDATE_USER_USE_CASE,
  useFactory: (userRepository: UserRepository): UpdateUserUseCase =>
    new UpdateUserUseCase(userRepository),
  inject: [USER_REPOSITORY],
};

const softDeleteUserUseCaseProvider = {
  provide: SOFT_DELETE_USER_USE_CASE,
  useFactory: (userRepository: UserRepository): SoftDeleteUserUseCase =>
    new SoftDeleteUserUseCase(userRepository),
  inject: [USER_REPOSITORY],
};

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    createUserUseCaseProvider,
    findUserByEmailUseCaseProvider,
    findUserByIdUseCaseProvider,
    findAllUsersUseCaseProvider,
    changeUserRoleUseCaseProvider,
    updateUserUseCaseProvider,
    softDeleteUserUseCaseProvider,
    RolesGuard,
  ],
  exports: [CreateUserUseCase, FindUserByEmailUseCase, FindUserByIdUseCase],
})
export class UsersModule {}
