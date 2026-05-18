import { AttributeRepository } from '../../domain/interfaces/attribute.repository';
import { AttributesError } from '../errors/attributes.error';

export class AssignAttributeToCategoryUseCase {
  constructor(private readonly attributeRepository: AttributeRepository) {}

  async execute(categoryId: string, attributeId: string): Promise<void> {
    const attribute = await this.attributeRepository.findById(attributeId);
    if (!attribute) {
      throw new AttributesError('ATTRIBUTE_NOT_FOUND');
    }

    await this.attributeRepository.assignToCategory(categoryId, attributeId);
  }
}
