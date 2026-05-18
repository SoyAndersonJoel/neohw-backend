import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/interfaces/product.repository';
import { ProductsError } from '../errors/products.error';

export type CreateProductInput = {
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  sku?: string;
  price: number;
  stock?: number;
  imageUrl?: string;
  categoryId: string;
  sellerId: string;
};

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const slug = this.generateSlug(input.name);

    const existingBySlug = await this.productRepository.findBySlug(slug);
    if (existingBySlug) {
      throw new ProductsError('PRODUCT_SLUG_IN_USE');
    }

    return this.productRepository.create({
      name: input.name.trim(),
      slug,
      description: input.description ?? null,
      brand: input.brand ?? null,
      model: input.model ?? null,
      sku: input.sku ?? null,
      price: input.price,
      stock: input.stock ?? 0,
      imageUrl: input.imageUrl ?? null,
      categoryId: input.categoryId,
      sellerId: input.sellerId,
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
