import { ProductAttributeWithName } from '../../domain/entities/product-attribute.entity';
import {
  ProductAttributeRepository,
  SetProductAttributeParams,
} from '../../domain/interfaces/product-attribute.repository';
import { ProductAttributesError } from '../errors/product-attributes.error';

export type UpdateProductAttributesInput = {
  productId: string;
  requesterId: string;
  requesterRole: string;
  productSellerId: string;
  attributes: SetProductAttributeParams[];
};

export class UpdateProductAttributesUseCase {
  constructor(
    private readonly productAttributeRepository: ProductAttributeRepository,
  ) {}

  async execute(input: UpdateProductAttributesInput): Promise<ProductAttributeWithName[]> {
    if (
      input.requesterRole === 'SELLER' &&
      input.productSellerId !== input.requesterId
    ) {
      throw new ProductAttributesError('INSUFFICIENT_PERMISSIONS');
    }

    return this.productAttributeRepository.updateAttributes(
      input.productId,
      input.attributes,
    );
  }
}
