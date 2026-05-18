import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesError } from '../application/errors/categories.error';

export const handleCategoriesError = (error: unknown): never => {
  if (error instanceof CategoriesError) {
    switch (error.code) {
      case 'CATEGORY_NOT_FOUND':
        throw new NotFoundException('Category not found');
      case 'CATEGORY_NAME_IN_USE':
        throw new ConflictException('A category with that name already exists');
      case 'CATEGORY_SLUG_IN_USE':
        throw new ConflictException('A category with that slug already exists');
      case 'PARENT_CATEGORY_NOT_FOUND':
        throw new NotFoundException('Parent category not found');
      case 'CANNOT_SET_SELF_AS_PARENT':
        throw new BadRequestException('A category cannot be its own parent');
      default:
        throw new BadRequestException('Operation not allowed');
    }
  }

  throw error;
};
