import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UsersError } from '../application/errors/users.error';

export const handleUsersError = (error: unknown): never => {
  if (error instanceof UsersError) {
    switch (error.code) {
      case 'EMAIL_IN_USE':
        throw new ConflictException('Email already registered');
      case 'USER_NOT_FOUND':
        throw new NotFoundException('User not found');
      case 'USER_DISABLED':
        throw new ForbiddenException('User is disabled');
      case 'CANNOT_CHANGE_OWN_ROLE':
        throw new ForbiddenException('Cannot change your own role');
      case 'INSUFFICIENT_PERMISSIONS':
        throw new ForbiddenException('Insufficient permissions for this action');
      case 'CANNOT_ASSIGN_SUPER_ADMIN':
        throw new ForbiddenException('Super Admin role cannot be assigned via API');
      default:
        throw new ForbiddenException('Operation not allowed');
    }
  }

  throw error;
};
