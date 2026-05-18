import { ProductWithDetails } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/interfaces/product.repository';
import { ProductsError } from '../errors/products.error';

export class FindProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<ProductWithDetails> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ProductsError('PRODUCT_NOT_FOUND');
    }
    return product;
  }
}
