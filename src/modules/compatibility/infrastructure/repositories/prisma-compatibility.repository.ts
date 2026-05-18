import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import {
  CompatibilityRule,
  CompatibilityRuleType,
  CompatibilityRuleWithAttributes,
} from '../../domain/entities/compatibility-rule.entity';
import {
  CompatibilityRepository,
  CreateCompatibilityRuleParams,
  UpdateCompatibilityRuleParams,
} from '../../domain/interfaces/compatibility.repository';

const ruleInclude = {
  sourceAttribute: { select: { name: true } },
  targetAttribute: { select: { name: true } },
} as const;

@Injectable()
export class PrismaCompatibilityRepository implements CompatibilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllRules(): Promise<CompatibilityRuleWithAttributes[]> {
    const rules = await this.prisma.compatibilityRule.findMany({
      include: ruleInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rules.map((r) => this.toDomainWithAttributes(r));
  }

  async findRuleById(id: string): Promise<CompatibilityRuleWithAttributes | null> {
    const rule = await this.prisma.compatibilityRule.findUnique({
      where: { id },
      include: ruleInclude,
    });
    return rule ? this.toDomainWithAttributes(rule) : null;
  }

  async findActiveRules(): Promise<CompatibilityRuleWithAttributes[]> {
    const rules = await this.prisma.compatibilityRule.findMany({
      where: { isActive: true },
      include: ruleInclude,
    });
    return rules.map((r) => this.toDomainWithAttributes(r));
  }

  async createRule(data: CreateCompatibilityRuleParams): Promise<CompatibilityRule> {
    const rule = await this.prisma.compatibilityRule.create({
      data: {
        name: data.name,
        description: data.description,
        sourceAttributeId: data.sourceAttributeId,
        targetAttributeId: data.targetAttributeId,
        ruleType: data.ruleType,
        condition: data.condition,
      },
    });
    return this.toDomain(rule);
  }

  async updateRule(id: string, data: UpdateCompatibilityRuleParams): Promise<CompatibilityRule> {
    const rule = await this.prisma.compatibilityRule.update({
      where: { id },
      data,
    });
    return this.toDomain(rule);
  }

  async deleteRule(id: string): Promise<void> {
    await this.prisma.compatibilityRule.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private toDomain(record: any): CompatibilityRule {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      sourceAttributeId: record.sourceAttributeId,
      targetAttributeId: record.targetAttributeId,
      ruleType: record.ruleType as CompatibilityRuleType,
      condition: record.condition as Record<string, any>,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toDomainWithAttributes(record: any): CompatibilityRuleWithAttributes {
    return {
      ...this.toDomain(record),
      sourceAttributeName: record.sourceAttribute.name,
      targetAttributeName: record.targetAttribute.name,
    };
  }
}
