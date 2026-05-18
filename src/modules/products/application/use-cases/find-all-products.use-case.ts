import {
  PaginatedProducts,
  ProductQueryOptions,
  ProductRepository,
} from '../../domain/interfaces/product.repository';

export class FindAllProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(options: ProductQueryOptions): Promise<PaginatedProducts> {
    return this.productRepository.findAll(options);
  }
}
