export type CompatibilityErrorCode =
  | 'RULE_NOT_FOUND'
  | 'ATTRIBUTE_NOT_FOUND'
  | 'PRODUCT_NOT_FOUND'
  | 'INSUFFICIENT_PRODUCTS'
  | 'INVALID_RULE_CONDITION';

export class CompatibilityError extends Error {
  constructor(
    public readonly code: CompatibilityErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}
