import { Test, TestingModule } from '@nestjs/testing';
import { CompatibilityController } from './compatibility.controller';
import { mock, mockClear } from 'jest-mock-extended';
import {
  CHECK_COMPATIBILITY_USE_CASE,
  CREATE_COMPATIBILITY_RULE_USE_CASE,
  FIND_ALL_RULES_USE_CASE,
  DELETE_RULE_USE_CASE,
} from '../compatibility.tokens';

import type { CheckCompatibilityUseCase } from '../application/use-cases/check-compatibility.use-case';
import type { CreateCompatibilityRuleUseCase } from '../application/use-cases/create-compatibility-rule.use-case';
import type { FindAllRulesUseCase } from '../application/use-cases/find-all-rules.use-case';
import type { DeleteRuleUseCase } from '../application/use-cases/delete-rule.use-case';

describe('CompatibilityController', () => {
  let controller: CompatibilityController;

  const checkCompatibilityUseCase = mock<CheckCompatibilityUseCase>();
  const createRuleUseCase = mock<CreateCompatibilityRuleUseCase>();
  const findAllRulesUseCase = mock<FindAllRulesUseCase>();
  const deleteRuleUseCase = mock<DeleteRuleUseCase>();

  beforeEach(async () => {
    mockClear(checkCompatibilityUseCase);
    mockClear(createRuleUseCase);
    mockClear(findAllRulesUseCase);
    mockClear(deleteRuleUseCase);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompatibilityController],
      providers: [
        { provide: CHECK_COMPATIBILITY_USE_CASE, useValue: checkCompatibilityUseCase },
        { provide: CREATE_COMPATIBILITY_RULE_USE_CASE, useValue: createRuleUseCase },
        { provide: FIND_ALL_RULES_USE_CASE, useValue: findAllRulesUseCase },
        { provide: DELETE_RULE_USE_CASE, useValue: deleteRuleUseCase },
      ],
    }).compile();

    controller = module.get<CompatibilityController>(CompatibilityController);
  });

  describe('check', () => {
    it('should call checkCompatibilityUseCase and return result', async () => {
      const dto = { productIds: ['prod-1', 'prod-2'] };
      const expectedResult = { compatible: true, results: [] };

      checkCompatibilityUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.check(dto);

      expect(checkCompatibilityUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAllRules', () => {
    it('should call findAllRulesUseCase and return formatted result', async () => {
      const mockRules = [
        { id: 'rule-1', name: 'Rule 1' },
        { id: 'rule-2', name: 'Rule 2' }
      ];

      findAllRulesUseCase.execute.mockResolvedValue(mockRules as any);

      const result = await controller.findAllRules();

      expect(findAllRulesUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual({ data: mockRules, total: 2 });
    });
  });

  describe('createRule', () => {
    it('should call createRuleUseCase and return success message', async () => {
      const dto = {
        name: 'New Rule',
        description: 'Desc',
        conditionExpression: 'A == B',
        categoryIds: ['cat-1']
      };
      const mockRule = { id: 'rule-1', ...dto };

      createRuleUseCase.execute.mockResolvedValue(mockRule as any);

      const result = await controller.createRule(dto as any);

      expect(createRuleUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        message: 'Regla de compatibilidad creada exitosamente',
        rule: mockRule,
      });
    });
  });

  describe('deleteRule', () => {
    it('should call deleteRuleUseCase and return success message', async () => {
      deleteRuleUseCase.execute.mockResolvedValue(undefined as any);

      const result = await controller.deleteRule('rule-1');

      expect(deleteRuleUseCase.execute).toHaveBeenCalledWith('rule-1');
      expect(result).toEqual({
        message: 'Regla de compatibilidad desactivada exitosamente',
      });
    });
  });
});
