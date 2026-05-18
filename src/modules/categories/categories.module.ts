import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import type { CategoryRepository } from './domain/interfaces/category.repository';
import { PrismaCategoryRepository } from './infrastructure/repositories/prisma-category.repository';
import { CategoriesController } from './infrastructure/categories.controller';
import { RolesGuard } from '../auth/infrastructure/guards/roles.guard';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { FindAllCategoriesUseCase } from './application/use-cases/find-all-categories.use-case';
import { FindCategoryByIdUseCase } from './application/use-cases/find-category-by-id.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from './application/use-cases/delete-category.use-case';
import {
  CATEGORY_REPOSITORY,
  CREATE_CATEGORY_USE_CASE,
  FIND_ALL_CATEGORIES_USE_CASE,
  FIND_CATEGORY_BY_ID_USE_CASE,
  UPDATE_CATEGORY_USE_CASE,
  DELETE_CATEGORY_USE_CASE,
} from './categories.tokens';

const createCategoryUseCaseProvider = {
  provide: CREATE_CATEGORY_USE_CASE,
  useFactory: (repo: CategoryRepository): CreateCategoryUseCase =>
    new CreateCategoryUseCase(repo),
  inject: [CATEGORY_REPOSITORY],
};

const findAllCategoriesUseCaseProvider = {
  provide: FIND_ALL_CATEGORIES_USE_CASE,
  useFactory: (repo: CategoryRepository): FindAllCategoriesUseCase =>
    new FindAllCategoriesUseCase(repo),
  inject: [CATEGORY_REPOSITORY],
};

const findCategoryByIdUseCaseProvider = {
  provide: FIND_CATEGORY_BY_ID_USE_CASE,
  useFactory: (repo: CategoryRepository): FindCategoryByIdUseCase =>
    new FindCategoryByIdUseCase(repo),
  inject: [CATEGORY_REPOSITORY],
};

const updateCategoryUseCaseProvider = {
  provide: UPDATE_CATEGORY_USE_CASE,
  useFactory: (repo: CategoryRepository): UpdateCategoryUseCase =>
    new UpdateCategoryUseCase(repo),
  inject: [CATEGORY_REPOSITORY],
};

const deleteCategoryUseCaseProvider = {
  provide: DELETE_CATEGORY_USE_CASE,
  useFactory: (repo: CategoryRepository): DeleteCategoryUseCase =>
    new DeleteCategoryUseCase(repo),
  inject: [CATEGORY_REPOSITORY],
};

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController],
  providers: [
    { provide: CATEGORY_REPOSITORY, useClass: PrismaCategoryRepository },
    createCategoryUseCaseProvider,
    findAllCategoriesUseCaseProvider,
    findCategoryByIdUseCaseProvider,
    updateCategoryUseCaseProvider,
    deleteCategoryUseCaseProvider,
    RolesGuard,
  ],
  exports: [CATEGORY_REPOSITORY, FIND_CATEGORY_BY_ID_USE_CASE],
})
export class CategoriesModule {}
