import { Product, ProductWithDetails } from '../entities/product.entity';

export interface CreateProductParams {
  name: string;
  slug: string;
  description?: string | null;
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  price: number;
  stock?: number;
  imageUrl?: string | null;
  categoryId: string;
  sellerId: string;
}

export interface UpdateProductParams {
  name?: string;
  slug?: string;
  description?: string | null;
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  price?: number;
  stock?: number;
  imageUrl?: string | null;
  categoryId?: string;
  isActive?: boolean;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isActive?: boolean;
  sellerId?: string;
  attributeFilters?: Record<string, string>;
}

export interface ProductQueryOptions {
  filters: ProductFilters;
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
}

export interface PaginatedProducts {
  data: ProductWithDetails[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductRepository {
  findAll(options: ProductQueryOptions): Promise<PaginatedProducts>;
  findById(id: string): Promise<ProductWithDetails | null>;
  findBySlug(slug: string): Promise<Product | null>;
  create(data: CreateProductParams): Promise<Product>;
  update(id: string, data: UpdateProductParams): Promise<Product>;
  softDelete(id: string): Promise<Product>;
}
