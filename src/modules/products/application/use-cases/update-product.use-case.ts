import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/interfaces/product.repository';
import { ProductsError } from '../errors/products.error';

export type UpdateProductInput = {
  productId: string;
  requesterId: string;
  requesterRole: string;
  name?: string;
  description?: string;
  brand?: string;
  model?: string;
  sku?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  categoryId?: string;
};

export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: UpdateProductInput): Promise<Product> {
    const existing = await this.productRepository.findById(input.productId);
    if (!existing) {
      throw new ProductsError('PRODUCT_NOT_FOUND');
    }

    // SELLER solo puede actualizar sus propios productos
    if (
      input.requesterRole === 'SELLER' &&
      existing.sellerId !== input.requesterId
    ) {
      throw new ProductsError('INSUFFICIENT_PERMISSIONS');
    }

    const slug = input.name ? this.generateSlug(input.name) : undefined;

    if (slug) {
      const existingBySlug = await this.productRepository.findBySlug(slug);
      if (existingBySlug && existingBySlug.id !== input.productId) {
        throw new ProductsError('PRODUCT_SLUG_IN_USE');
      }
    }

    return this.productRepository.update(input.productId, {
      name: input.name?.trim(),
      slug,
      description: input.description,
      brand: input.brand,
      model: input.model,
      sku: input.sku,
      price: input.price,
      stock: input.stock,
      imageUrl: input.imageUrl,
      categoryId: input.categoryId,
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
