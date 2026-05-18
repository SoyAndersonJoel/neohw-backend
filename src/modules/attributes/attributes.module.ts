import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import type { AttributeRepository } from './domain/interfaces/attribute.repository';
import { PrismaAttributeRepository } from './infrastructure/repositories/prisma-attribute.repository';
import { AttributesController } from './infrastructure/attributes.controller';
import { RolesGuard } from '../auth/infrastructure/guards/roles.guard';
import { CreateAttributeUseCase } from './application/use-cases/create-attribute.use-case';
import { FindAllAttributesUseCase } from './application/use-cases/find-all-attributes.use-case';
import { FindAttributesByCategoryUseCase } from './application/use-cases/find-attributes-by-category.use-case';
import { UpdateAttributeUseCase } from './application/use-cases/update-attribute.use-case';
import { AssignAttributeToCategoryUseCase } from './application/use-cases/assign-attribute-to-category.use-case';
import {
  ATTRIBUTE_REPOSITORY,
  CREATE_ATTRIBUTE_USE_CASE,
  FIND_ALL_ATTRIBUTES_USE_CASE,
  FIND_ATTRIBUTES_BY_CATEGORY_USE_CASE,
  UPDATE_ATTRIBUTE_USE_CASE,
  ASSIGN_ATTRIBUTE_TO_CATEGORY_USE_CASE,
} from './attributes.tokens';

const createAttributeUseCaseProvider = {
  provide: CREATE_ATTRIBUTE_USE_CASE,
  useFactory: (repo: AttributeRepository): CreateAttributeUseCase =>
    new CreateAttributeUseCase(repo),
  inject: [ATTRIBUTE_REPOSITORY],
};

const findAllAttributesUseCaseProvider = {
  provide: FIND_ALL_ATTRIBUTES_USE_CASE,
  useFactory: (repo: AttributeRepository): FindAllAttributesUseCase =>
    new FindAllAttributesUseCase(repo),
  inject: [ATTRIBUTE_REPOSITORY],
};

const findAttributesByCategoryUseCaseProvider = {
  provide: FIND_ATTRIBUTES_BY_CATEGORY_USE_CASE,
  useFactory: (repo: AttributeRepository): FindAttributesByCategoryUseCase =>
    new FindAttributesByCategoryUseCase(repo),
  inject: [ATTRIBUTE_REPOSITORY],
};

const updateAttributeUseCaseProvider = {
  provide: UPDATE_ATTRIBUTE_USE_CASE,
  useFactory: (repo: AttributeRepository): UpdateAttributeUseCase =>
    new UpdateAttributeUseCase(repo),
  inject: [ATTRIBUTE_REPOSITORY],
};

const assignAttributeToCategoryUseCaseProvider = {
  provide: ASSIGN_ATTRIBUTE_TO_CATEGORY_USE_CASE,
  useFactory: (repo: AttributeRepository): AssignAttributeToCategoryUseCase =>
    new AssignAttributeToCategoryUseCase(repo),
  inject: [ATTRIBUTE_REPOSITORY],
};

@Module({
  imports: [PrismaModule],
  controllers: [AttributesController],
  providers: [
    { provide: ATTRIBUTE_REPOSITORY, useClass: PrismaAttributeRepository },
    createAttributeUseCaseProvider,
    findAllAttributesUseCaseProvider,
    findAttributesByCategoryUseCaseProvider,
    updateAttributeUseCaseProvider,
    assignAttributeToCategoryUseCaseProvider,
    RolesGuard,
  ],
  exports: [ATTRIBUTE_REPOSITORY, FIND_ATTRIBUTES_BY_CATEGORY_USE_CASE],
})
export class AttributesModule {}
