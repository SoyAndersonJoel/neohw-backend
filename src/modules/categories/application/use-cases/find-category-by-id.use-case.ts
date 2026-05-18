import { CategoryWithChildren } from '../../domain/entities/category.entity';
import { CategoryRepository } from '../../domain/interfaces/category.repository';
import { CategoriesError } from '../errors/categories.error';

export class FindCategoryByIdUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<CategoryWithChildren> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoriesError('CATEGORY_NOT_FOUND');
    }
    return category;
  }
}
