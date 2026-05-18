import { Attribute } from '../../domain/entities/attribute.entity';
import { AttributeRepository } from '../../domain/interfaces/attribute.repository';

export class FindAllAttributesUseCase {
  constructor(private readonly attributeRepository: AttributeRepository) {}

  async execute(): Promise<Attribute[]> {
    return this.attributeRepository.findAll();
  }
}
