import { CompatibilityRuleWithAttributes } from '../../domain/entities/compatibility-rule.entity';
import { CompatibilityRepository } from '../../domain/interfaces/compatibility.repository';

export class FindAllRulesUseCase {
  constructor(private readonly compatibilityRepository: CompatibilityRepository) {}

  async execute(): Promise<CompatibilityRuleWithAttributes[]> {
    return this.compatibilityRepository.findAllRules();
  }
}
