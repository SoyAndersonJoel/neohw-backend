import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { handleAttributesError } from './attributes-error-mapper';

@Injectable()
export class AttributesErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        handleAttributesError(error);
        throw error;
      }),
    );
  }
}
