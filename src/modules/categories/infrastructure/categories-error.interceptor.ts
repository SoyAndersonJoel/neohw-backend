import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { handleCategoriesError } from './categories-error-mapper';

@Injectable()
export class CategoriesErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        handleCategoriesError(error);
        throw error;
      }),
    );
  }
}
