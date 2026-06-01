import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { InsufficientStockException } from '../domain/exceptions/insufficient-stock.exception';

@Injectable()
export class CartsErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof InsufficientStockException) {
          throw new BadRequestException({
            message: error.message,
            code: 'INSUFFICIENT_STOCK',
            details: {
              productId: error.productId,
              requested: error.requested,
              available: error.available,
            },
          });
        }
        throw error;
      }),
    );
  }
}
