import { Category } from '../../domain/entities/category.entity';
import { CategoryRepository } from '../../domain/interfaces/category.repository';
import { CategoriesError } from '../errors/categories.error';

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<Category> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new CategoriesError('CATEGORY_NOT_FOUND');
    }

    return this.categoryRepository.softDelete(id);
  }
}
