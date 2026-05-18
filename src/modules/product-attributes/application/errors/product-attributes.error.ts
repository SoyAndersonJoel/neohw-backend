export type ProductAttributesErrorCode =
  | 'PRODUCT_NOT_FOUND'
  | 'ATTRIBUTE_NOT_FOUND'
  | 'INVALID_ATTRIBUTE_VALUE'
  | 'ATTRIBUTE_NOT_IN_CATEGORY'
  | 'INSUFFICIENT_PERMISSIONS';

export class ProductAttributesError extends Error {
  constructor(
    public readonly code: ProductAttributesErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}
