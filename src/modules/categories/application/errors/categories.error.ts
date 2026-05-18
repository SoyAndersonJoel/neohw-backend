export type CategoriesErrorCode =
  | 'CATEGORY_NOT_FOUND'
  | 'CATEGORY_NAME_IN_USE'
  | 'CATEGORY_SLUG_IN_USE'
  | 'PARENT_CATEGORY_NOT_FOUND'
  | 'CANNOT_SET_SELF_AS_PARENT';

export class CategoriesError extends Error {
  constructor(
    public readonly code: CategoriesErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}
