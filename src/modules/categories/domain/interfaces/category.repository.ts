import { Category, CategoryWithChildren } from '../entities/category.entity';

export interface CreateCategoryParams {
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
}

export interface UpdateCategoryParams {
  name?: string;
  slug?: string;
  description?: string | null;
  parentId?: string | null;
  isActive?: boolean;
}

export interface CategoryRepository {
  findAll(): Promise<CategoryWithChildren[]>;
  findById(id: string): Promise<CategoryWithChildren | null>;
  findBySlug(slug: string): Promise<Category | null>;
  create(data: CreateCategoryParams): Promise<Category>;
  update(id: string, data: UpdateCategoryParams): Promise<Category>;
  softDelete(id: string): Promise<Category>;
}
