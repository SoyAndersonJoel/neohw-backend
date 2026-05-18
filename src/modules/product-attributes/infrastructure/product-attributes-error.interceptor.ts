import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { handleProductAttributesError } from './product-attributes-error-mapper';

@Injectable()
export class ProductAttributesErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        handleProductAttributesError(error);
        throw error;
      }),
    );
  }
}
