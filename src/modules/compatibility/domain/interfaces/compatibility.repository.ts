import {
  CompatibilityRule,
  CompatibilityRuleType,
  CompatibilityRuleWithAttributes,
} from '../entities/compatibility-rule.entity';

export interface CreateCompatibilityRuleParams {
  name: string;
  description?: string | null;
  sourceAttributeId: string;
  targetAttributeId: string;
  ruleType: CompatibilityRuleType;
  condition: Record<string, any>;
}

export interface UpdateCompatibilityRuleParams {
  name?: string;
  description?: string | null;
  ruleType?: CompatibilityRuleType;
  condition?: Record<string, any>;
  isActive?: boolean;
}

export interface CompatibilityRepository {
  findAllRules(): Promise<CompatibilityRuleWithAttributes[]>;
  findRuleById(id: string): Promise<CompatibilityRuleWithAttributes | null>;
  findActiveRules(): Promise<CompatibilityRuleWithAttributes[]>;
  createRule(data: CreateCompatibilityRuleParams): Promise<CompatibilityRule>;
  updateRule(id: string, data: UpdateCompatibilityRuleParams): Promise<CompatibilityRule>;
  deleteRule(id: string): Promise<void>;
}
