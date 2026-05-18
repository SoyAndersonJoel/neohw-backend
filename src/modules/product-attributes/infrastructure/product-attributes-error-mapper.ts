import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProductAttributesError } from '../application/errors/product-attributes.error';

export const handleProductAttributesError = (error: unknown): never => {
  if (error instanceof ProductAttributesError) {
    switch (error.code) {
      case 'PRODUCT_NOT_FOUND':
        throw new NotFoundException('Product not found');
      case 'ATTRIBUTE_NOT_FOUND':
        throw new NotFoundException('Attribute not found');
      case 'INVALID_ATTRIBUTE_VALUE':
        throw new BadRequestException('Invalid attribute value');
      case 'ATTRIBUTE_NOT_IN_CATEGORY':
        throw new BadRequestException('Attribute does not belong to this product category');
      case 'INSUFFICIENT_PERMISSIONS':
        throw new ForbiddenException('Insufficient permissions for this action');
      default:
        throw new BadRequestException('Operation not allowed');
    }
  }

  throw error;
};
