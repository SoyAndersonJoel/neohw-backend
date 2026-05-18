import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CompatibilityError } from '../application/errors/compatibility.error';

export const handleCompatibilityError = (error: unknown): never => {
  if (error instanceof CompatibilityError) {
    switch (error.code) {
      case 'RULE_NOT_FOUND':
        throw new NotFoundException('Compatibility rule not found');
      case 'ATTRIBUTE_NOT_FOUND':
        throw new NotFoundException('Attribute not found');
      case 'PRODUCT_NOT_FOUND':
        throw new NotFoundException(error.message || 'Product not found');
      case 'INSUFFICIENT_PRODUCTS':
        throw new BadRequestException(error.message || 'At least 2 products are required');
      case 'INVALID_RULE_CONDITION':
        throw new BadRequestException('Invalid rule condition');
      default:
        throw new BadRequestException('Operation not allowed');
    }
  }

  throw error;
};
