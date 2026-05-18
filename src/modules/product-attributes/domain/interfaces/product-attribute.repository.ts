import { ProductAttributeWithName } from '../entities/product-attribute.entity';

export interface SetProductAttributeParams {
  attributeId: string;
  value: string;
}

export interface ProductAttributeRepository {
  findByProductId(productId: string): Promise<ProductAttributeWithName[]>;
  setAttributes(productId: string, attributes: SetProductAttributeParams[]): Promise<ProductAttributeWithName[]>;
  updateAttributes(productId: string, attributes: SetProductAttributeParams[]): Promise<ProductAttributeWithName[]>;
}
