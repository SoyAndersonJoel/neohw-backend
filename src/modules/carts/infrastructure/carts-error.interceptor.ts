import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { InsufficientStockException } from '../domain/exceptions/insufficient-stock.exception';
import { ProductNotFoundException } from '../domain/exceptions/product-not-found.exception';
import { CartItemNotFoundException } from '../domain/exceptions/cart-item-not-found.exception';

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
        if (error instanceof ProductNotFoundException || error instanceof CartItemNotFoundException) {
          throw new NotFoundException({
            message: error.message,
            code: 'NOT_FOUND',
          });
        }
        throw error;
      }),
    );
  }
}

