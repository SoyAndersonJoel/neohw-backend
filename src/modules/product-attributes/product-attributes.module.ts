import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import type { ProductAttributeRepository } from './domain/interfaces/product-attribute.repository';
import { PrismaProductAttributeRepository } from './infrastructure/repositories/prisma-product-attribute.repository';
import { ProductAttributesController } from './infrastructure/product-attributes.controller';
import { RolesGuard } from '../auth/infrastructure/guards/roles.guard';
import { SetProductAttributesUseCase } from './application/use-cases/set-product-attributes.use-case';
import { UpdateProductAttributesUseCase } from './application/use-cases/update-product-attributes.use-case';
import { FindProductAttributesUseCase } from './application/use-cases/find-product-attributes.use-case';
import {
  PRODUCT_ATTRIBUTE_REPOSITORY,
  SET_PRODUCT_ATTRIBUTES_USE_CASE,
  UPDATE_PRODUCT_ATTRIBUTES_USE_CASE,
  FIND_PRODUCT_ATTRIBUTES_USE_CASE,
} from './product-attributes.tokens';

const setProductAttributesUseCaseProvider = {
  provide: SET_PRODUCT_ATTRIBUTES_USE_CASE,
  useFactory: (repo: ProductAttributeRepository): SetProductAttributesUseCase =>
    new SetProductAttributesUseCase(repo),
  inject: [PRODUCT_ATTRIBUTE_REPOSITORY],
};

const updateProductAttributesUseCaseProvider = {
  provide: UPDATE_PRODUCT_ATTRIBUTES_USE_CASE,
  useFactory: (repo: ProductAttributeRepository): UpdateProductAttributesUseCase =>
    new UpdateProductAttributesUseCase(repo),
  inject: [PRODUCT_ATTRIBUTE_REPOSITORY],
};

const findProductAttributesUseCaseProvider = {
  provide: FIND_PRODUCT_ATTRIBUTES_USE_CASE,
  useFactory: (repo: ProductAttributeRepository): FindProductAttributesUseCase =>
    new FindProductAttributesUseCase(repo),
  inject: [PRODUCT_ATTRIBUTE_REPOSITORY],
};

@Module({
  imports: [PrismaModule, ProductsModule],
  controllers: [ProductAttributesController],
  providers: [
    { provide: PRODUCT_ATTRIBUTE_REPOSITORY, useClass: PrismaProductAttributeRepository },
    setProductAttributesUseCaseProvider,
    updateProductAttributesUseCaseProvider,
    findProductAttributesUseCaseProvider,
    RolesGuard,
  ],
  exports: [PRODUCT_ATTRIBUTE_REPOSITORY],
})
export class ProductAttributesModule {}
