export type UsersErrorCode =
  | 'EMAIL_IN_USE'
  | 'USER_NOT_FOUND'
  | 'USER_DISABLED'
  | 'CANNOT_CHANGE_OWN_ROLE'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'CANNOT_ASSIGN_SUPER_ADMIN';

export class UsersError extends Error {
  constructor(
    public readonly code: UsersErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}
