import { Attribute } from '../../domain/entities/attribute.entity';
import { AttributeRepository } from '../../domain/interfaces/attribute.repository';

export class FindAttributesByCategoryUseCase {
  constructor(private readonly attributeRepository: AttributeRepository) {}

  async execute(categoryId: string): Promise<Attribute[]> {
    return this.attributeRepository.findByCategoryId(categoryId);
  }
}
