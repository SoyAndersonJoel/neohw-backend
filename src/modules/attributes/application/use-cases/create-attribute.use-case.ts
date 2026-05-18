import { Attribute, AttributeDataType } from '../../domain/entities/attribute.entity';
import { AttributeRepository } from '../../domain/interfaces/attribute.repository';
import { AttributesError } from '../errors/attributes.error';

export type CreateAttributeInput = {
  name: string;
  dataType?: AttributeDataType;
  unit?: string;
  isFilterable?: boolean;
  isRequired?: boolean;
  options?: string[];
};

export class CreateAttributeUseCase {
  constructor(private readonly attributeRepository: AttributeRepository) {}

  async execute(input: CreateAttributeInput): Promise<Attribute> {
    const slug = this.generateSlug(input.name);

    const existing = await this.attributeRepository.findBySlug(slug);
    if (existing) {
      throw new AttributesError('ATTRIBUTE_SLUG_IN_USE');
    }

    return this.attributeRepository.create({
      name: input.name.trim(),
      slug,
      dataType: input.dataType ?? AttributeDataType.TEXT,
      unit: input.unit ?? null,
      isFilterable: input.isFilterable ?? false,
      isRequired: input.isRequired ?? false,
      options: input.options ?? null,
    });
  }

  private generateSlug(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
