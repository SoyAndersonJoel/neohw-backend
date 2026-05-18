import { ProductAttributeWithName } from '../../domain/entities/product-attribute.entity';
import {
  ProductAttributeRepository,
  SetProductAttributeParams,
} from '../../domain/interfaces/product-attribute.repository';
import { ProductAttributesError } from '../errors/product-attributes.error';

export type SetProductAttributesInput = {
  productId: string;
  requesterId: string;
  requesterRole: string;
  productSellerId: string;
  attributes: SetProductAttributeParams[];
};

export class SetProductAttributesUseCase {
  constructor(
    private readonly productAttributeRepository: ProductAttributeRepository,
  ) {}

  async execute(input: SetProductAttributesInput): Promise<ProductAttributeWithName[]> {
    // SELLER solo puede asignar atributos a sus propios productos
    if (
      input.requesterRole === 'SELLER' &&
      input.productSellerId !== input.requesterId
    ) {
      throw new ProductAttributesError('INSUFFICIENT_PERMISSIONS');
    }

    return this.productAttributeRepository.setAttributes(
      input.productId,
      input.attributes,
    );
  }
}
