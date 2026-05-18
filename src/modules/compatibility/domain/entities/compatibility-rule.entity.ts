export enum CompatibilityRuleType {
  MUST_MATCH = 'MUST_MATCH',
  RANGE_CHECK = 'RANGE_CHECK',
  POWER_SUFFICIENT = 'POWER_SUFFICIENT',
  CUSTOM = 'CUSTOM',
}

export type CompatibilityRule = {
  id: string;
  name: string;
  description: string | null;
  sourceAttributeId: string;
  targetAttributeId: string;
  ruleType: CompatibilityRuleType;
  condition: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CompatibilityRuleWithAttributes = CompatibilityRule & {
  sourceAttributeName: string;
  targetAttributeName: string;
};

export type CompatibilityCheckResult = {
  ruleId: string;
  ruleName: string;
  status: 'PASS' | 'FAIL' | 'SKIPPED';
  sourceProduct: { id: string; name: string };
  targetProduct: { id: string; name: string };
  detail: string;
};
