import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { handleCompatibilityError } from './compatibility-error-mapper';

@Injectable()
export class CompatibilityErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        handleCompatibilityError(error);
        throw error;
      }),
    );
  }
}
