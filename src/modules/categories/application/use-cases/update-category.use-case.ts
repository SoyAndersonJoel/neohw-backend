import { Category } from '../../domain/entities/category.entity';
import { CategoryRepository } from '../../domain/interfaces/category.repository';
import { CategoriesError } from '../errors/categories.error';

export type UpdateCategoryInput = {
  id: string;
  name?: string;
  description?: string;
  parentId?: string | null;
};

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<Category> {
    const existing = await this.categoryRepository.findById(input.id);
    if (!existing) {
      throw new CategoriesError('CATEGORY_NOT_FOUND');
    }

    if (input.parentId === input.id) {
      throw new CategoriesError('CANNOT_SET_SELF_AS_PARENT');
    }

    if (input.parentId) {
      const parent = await this.categoryRepository.findById(input.parentId);
      if (!parent) {
        throw new CategoriesError('PARENT_CATEGORY_NOT_FOUND');
      }
    }

    const slug = input.name ? this.generateSlug(input.name) : undefined;

    if (slug) {
      const existingBySlug = await this.categoryRepository.findBySlug(slug);
      if (existingBySlug && existingBySlug.id !== input.id) {
        throw new CategoriesError('CATEGORY_SLUG_IN_USE');
      }
    }

    return this.categoryRepository.update(input.id, {
      name: input.name?.trim(),
      slug,
      description: input.description,
      parentId: input.parentId,
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
