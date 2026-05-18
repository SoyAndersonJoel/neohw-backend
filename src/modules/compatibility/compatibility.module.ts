import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import type { CompatibilityRepository } from './domain/interfaces/compatibility.repository';
import type { ProductAttributesFetcher } from './application/use-cases/check-compatibility.use-case';
import { PrismaCompatibilityRepository } from './infrastructure/repositories/prisma-compatibility.repository';
import { PrismaProductAttributesFetcher } from './infrastructure/services/prisma-product-attributes-fetcher';
import { CompatibilityController } from './infrastructure/compatibility.controller';
import { CompatibilityEngine } from './application/services/compatibility-engine.service';
import { RolesGuard } from '../auth/infrastructure/guards/roles.guard';
import { CheckCompatibilityUseCase } from './application/use-cases/check-compatibility.use-case';
import { CreateCompatibilityRuleUseCase } from './application/use-cases/create-compatibility-rule.use-case';
import { FindAllRulesUseCase } from './application/use-cases/find-all-rules.use-case';
import { DeleteRuleUseCase } from './application/use-cases/delete-rule.use-case';
import {
  COMPATIBILITY_REPOSITORY,
  PRODUCT_ATTRIBUTES_FETCHER,
  COMPATIBILITY_ENGINE,
  CHECK_COMPATIBILITY_USE_CASE,
  CREATE_COMPATIBILITY_RULE_USE_CASE,
  FIND_ALL_RULES_USE_CASE,
  DELETE_RULE_USE_CASE,
} from './compatibility.tokens';

const checkCompatibilityUseCaseProvider = {
  provide: CHECK_COMPATIBILITY_USE_CASE,
  useFactory: (
    repo: CompatibilityRepository,
    fetcher: ProductAttributesFetcher,
    engine: CompatibilityEngine,
  ): CheckCompatibilityUseCase =>
    new CheckCompatibilityUseCase(repo, fetcher, engine),
  inject: [COMPATIBILITY_REPOSITORY, PRODUCT_ATTRIBUTES_FETCHER, COMPATIBILITY_ENGINE],
};

const createRuleUseCaseProvider = {
  provide: CREATE_COMPATIBILITY_RULE_USE_CASE,
  useFactory: (repo: CompatibilityRepository): CreateCompatibilityRuleUseCase =>
    new CreateCompatibilityRuleUseCase(repo),
  inject: [COMPATIBILITY_REPOSITORY],
};

const findAllRulesUseCaseProvider = {
  provide: FIND_ALL_RULES_USE_CASE,
  useFactory: (repo: CompatibilityRepository): FindAllRulesUseCase =>
    new FindAllRulesUseCase(repo),
  inject: [COMPATIBILITY_REPOSITORY],
};

const deleteRuleUseCaseProvider = {
  provide: DELETE_RULE_USE_CASE,
  useFactory: (repo: CompatibilityRepository): DeleteRuleUseCase =>
    new DeleteRuleUseCase(repo),
  inject: [COMPATIBILITY_REPOSITORY],
};

@Module({
  imports: [PrismaModule],
  controllers: [CompatibilityController],
  providers: [
    { provide: COMPATIBILITY_REPOSITORY, useClass: PrismaCompatibilityRepository },
    { provide: PRODUCT_ATTRIBUTES_FETCHER, useClass: PrismaProductAttributesFetcher },
    { provide: COMPATIBILITY_ENGINE, useValue: new CompatibilityEngine() },
    checkCompatibilityUseCaseProvider,
    createRuleUseCaseProvider,
    findAllRulesUseCaseProvider,
    deleteRuleUseCaseProvider,
    RolesGuard,
  ],
})
export class CompatibilityModule {}
