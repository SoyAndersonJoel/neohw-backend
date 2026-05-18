import { CategoryWithChildren } from '../../domain/entities/category.entity';
import { CategoryRepository } from '../../domain/interfaces/category.repository';

export class FindAllCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(): Promise<CategoryWithChildren[]> {
    return this.categoryRepository.findAll();
  }
}
