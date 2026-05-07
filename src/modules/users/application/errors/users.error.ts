export type UsersErrorCode = 'EMAIL_IN_USE';

export class UsersError extends Error {
  constructor(
    public readonly code: UsersErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}
