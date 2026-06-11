import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersError } from '../../users/application/errors/users.error';
import { AuthError } from '../application/errors/auth.error';

export const handleAuthError = (error: unknown): never => {
  if (error instanceof AuthError) {
    switch (error.code) {
      case 'EMAIL_IN_USE':
        throw new ConflictException('Email already registered');
      case 'USER_DISABLED':
        throw new ForbiddenException('User is disabled');
      case 'UNVERIFIED_ACCOUNT':
        throw new ForbiddenException('Tu cuenta no ha sido verificada. Revisa tu correo e ingresa el código OTP.');
      case 'INVALID_CREDENTIALS':
      case 'INVALID_REFRESH_TOKEN':
        throw new UnauthorizedException('Invalid credentials');
      default:
        throw new UnauthorizedException('Unauthorized');
    }
  }

  if (error instanceof UsersError) {
    switch (error.code) {
      case 'EMAIL_IN_USE':
        throw new ConflictException('Email already registered');
      default:
        throw new UnauthorizedException('Unauthorized');
    }
  }

  throw error;
};
