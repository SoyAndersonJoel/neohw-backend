import { Category } from '../../domain/entities/category.entity';
import { CategoryRepository } from '../../domain/interfaces/category.repository';
import { CategoriesError } from '../errors/categories.error';

export type CreateCategoryInput = {
  name: string;
  description?: string;
  parentId?: string;
};

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    const slug = this.generateSlug(input.name);

    const existingBySlug = await this.categoryRepository.findBySlug(slug);
    if (existingBySlug) {
      throw new CategoriesError('CATEGORY_SLUG_IN_USE');
    }

    if (input.parentId) {
      const parent = await this.categoryRepository.findById(input.parentId);
      if (!parent) {
        throw new CategoriesError('PARENT_CATEGORY_NOT_FOUND');
      }
    }

    return this.categoryRepository.create({
      name: input.name.trim(),
      slug,
      description: input.description ?? null,
      parentId: input.parentId ?? null,
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
