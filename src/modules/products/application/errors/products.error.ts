export type ProductsErrorCode =
  | 'PRODUCT_NOT_FOUND'
  | 'PRODUCT_SLUG_IN_USE'
  | 'PRODUCT_SKU_IN_USE'
  | 'CATEGORY_NOT_FOUND'
  | 'INSUFFICIENT_PERMISSIONS';

export class ProductsError extends Error {
  constructor(
    public readonly code: ProductsErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}
