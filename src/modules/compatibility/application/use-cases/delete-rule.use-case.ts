import { CompatibilityRepository } from '../../domain/interfaces/compatibility.repository';
import { CompatibilityError } from '../errors/compatibility.error';

export class DeleteRuleUseCase {
  constructor(private readonly compatibilityRepository: CompatibilityRepository) {}

  async execute(id: string): Promise<void> {
    const rule = await this.compatibilityRepository.findRuleById(id);
    if (!rule) {
      throw new CompatibilityError('RULE_NOT_FOUND');
    }

    await this.compatibilityRepository.deleteRule(id);
  }
}
