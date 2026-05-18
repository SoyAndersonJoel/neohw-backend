import { ProductAttributeWithName } from '../../domain/entities/product-attribute.entity';
import { ProductAttributeRepository } from '../../domain/interfaces/product-attribute.repository';

export class FindProductAttributesUseCase {
  constructor(
    private readonly productAttributeRepository: ProductAttributeRepository,
  ) {}

  async execute(productId: string): Promise<ProductAttributeWithName[]> {
    return this.productAttributeRepository.findByProductId(productId);
  }
}
