export type AttributesErrorCode =
  | 'ATTRIBUTE_NOT_FOUND'
  | 'ATTRIBUTE_NAME_IN_USE'
  | 'ATTRIBUTE_SLUG_IN_USE'
  | 'ATTRIBUTE_ALREADY_ASSIGNED'
  | 'ATTRIBUTE_NOT_ASSIGNED'
  | 'CATEGORY_NOT_FOUND';

export class AttributesError extends Error {
  constructor(
    public readonly code: AttributesErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}
