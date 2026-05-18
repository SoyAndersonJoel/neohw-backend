import { CompatibilityRule, CompatibilityRuleType } from '../../domain/entities/compatibility-rule.entity';
import { CompatibilityRepository } from '../../domain/interfaces/compatibility.repository';

export type CreateCompatibilityRuleInput = {
  name: string;
  description?: string;
  sourceAttributeId: string;
  targetAttributeId: string;
  ruleType: CompatibilityRuleType;
  condition: Record<string, any>;
};

export class CreateCompatibilityRuleUseCase {
  constructor(private readonly compatibilityRepository: CompatibilityRepository) {}

  async execute(input: CreateCompatibilityRuleInput): Promise<CompatibilityRule> {
    return this.compatibilityRepository.createRule({
      name: input.name.trim(),
      description: input.description ?? null,
      sourceAttributeId: input.sourceAttributeId,
      targetAttributeId: input.targetAttributeId,
      ruleType: input.ruleType,
      condition: input.condition,
    });
  }
}
