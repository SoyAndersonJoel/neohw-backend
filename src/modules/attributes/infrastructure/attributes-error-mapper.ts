import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AttributesError } from '../application/errors/attributes.error';

export const handleAttributesError = (error: unknown): never => {
  if (error instanceof AttributesError) {
    switch (error.code) {
      case 'ATTRIBUTE_NOT_FOUND':
        throw new NotFoundException('Attribute not found');
      case 'ATTRIBUTE_NAME_IN_USE':
        throw new ConflictException('An attribute with that name already exists');
      case 'ATTRIBUTE_SLUG_IN_USE':
        throw new ConflictException('An attribute with that slug already exists');
      case 'ATTRIBUTE_ALREADY_ASSIGNED':
        throw new ConflictException('Attribute is already assigned to this category');
      case 'ATTRIBUTE_NOT_ASSIGNED':
        throw new BadRequestException('Attribute is not assigned to this category');
      case 'CATEGORY_NOT_FOUND':
        throw new NotFoundException('Category not found');
      default:
        throw new BadRequestException('Operation not allowed');
    }
  }

  throw error;
};
