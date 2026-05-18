import { Attribute, AttributeDataType } from '../../domain/entities/attribute.entity';
import { AttributeRepository } from '../../domain/interfaces/attribute.repository';
import { AttributesError } from '../errors/attributes.error';

export type UpdateAttributeInput = {
  id: string;
  name?: string;
  dataType?: AttributeDataType;
  unit?: string | null;
  isFilterable?: boolean;
  isRequired?: boolean;
  options?: string[] | null;
};

export class UpdateAttributeUseCase {
  constructor(private readonly attributeRepository: AttributeRepository) {}

  async execute(input: UpdateAttributeInput): Promise<Attribute> {
    const existing = await this.attributeRepository.findById(input.id);
    if (!existing) {
      throw new AttributesError('ATTRIBUTE_NOT_FOUND');
    }

    const slug = input.name ? this.generateSlug(input.name) : undefined;

    if (slug) {
      const existingBySlug = await this.attributeRepository.findBySlug(slug);
      if (existingBySlug && existingBySlug.id !== input.id) {
        throw new AttributesError('ATTRIBUTE_SLUG_IN_USE');
      }
    }

    return this.attributeRepository.update(input.id, {
      name: input.name?.trim(),
      slug,
      dataType: input.dataType,
      unit: input.unit,
      isFilterable: input.isFilterable,
      isRequired: input.isRequired,
      options: input.options,
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
