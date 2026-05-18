import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProductsError } from '../application/errors/products.error';

export const handleProductsError = (error: unknown): never => {
  if (error instanceof ProductsError) {
    switch (error.code) {
      case 'PRODUCT_NOT_FOUND':
        throw new NotFoundException('Product not found');
      case 'PRODUCT_SLUG_IN_USE':
        throw new ConflictException('A product with that slug already exists');
      case 'PRODUCT_SKU_IN_USE':
        throw new ConflictException('A product with that SKU already exists');
      case 'CATEGORY_NOT_FOUND':
        throw new NotFoundException('Category not found');
      case 'INSUFFICIENT_PERMISSIONS':
        throw new ForbiddenException('Insufficient permissions for this action');
      default:
        throw new ForbiddenException('Operation not allowed');
    }
  }

  throw error;
};
