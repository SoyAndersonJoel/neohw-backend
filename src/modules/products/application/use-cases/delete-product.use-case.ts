import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/interfaces/product.repository';
import { ProductsError } from '../errors/products.error';

export class DeleteProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<Product> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new ProductsError('PRODUCT_NOT_FOUND');
    }

    return this.productRepository.softDelete(id);
  }
}
