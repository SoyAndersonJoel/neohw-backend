import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { handleAuthError } from './auth-error-mapper';

@Injectable()
export class AuthErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        handleAuthError(error);
        throw error; // Fallback in case handleAuthError doesn't throw
      }),
    );
  }
}
