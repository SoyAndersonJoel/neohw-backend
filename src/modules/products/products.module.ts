import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import type { ProductRepository } from './domain/interfaces/product.repository';
import { PrismaProductRepository } from './infrastructure/repositories/prisma-product.repository';
import { ProductsController } from './infrastructure/products.controller';
import { RolesGuard } from '../auth/infrastructure/guards/roles.guard';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { FindAllProductsUseCase } from './application/use-cases/find-all-products.use-case';
import { FindProductByIdUseCase } from './application/use-cases/find-product-by-id.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import {
  PRODUCT_REPOSITORY,
  CREATE_PRODUCT_USE_CASE,
  FIND_ALL_PRODUCTS_USE_CASE,
  FIND_PRODUCT_BY_ID_USE_CASE,
  UPDATE_PRODUCT_USE_CASE,
  DELETE_PRODUCT_USE_CASE,
} from './products.tokens';

const createProductUseCaseProvider = {
  provide: CREATE_PRODUCT_USE_CASE,
  useFactory: (repo: ProductRepository): CreateProductUseCase =>
    new CreateProductUseCase(repo),
  inject: [PRODUCT_REPOSITORY],
};

const findAllProductsUseCaseProvider = {
  provide: FIND_ALL_PRODUCTS_USE_CASE,
  useFactory: (repo: ProductRepository): FindAllProductsUseCase =>
    new FindAllProductsUseCase(repo),
  inject: [PRODUCT_REPOSITORY],
};

const findProductByIdUseCaseProvider = {
  provide: FIND_PRODUCT_BY_ID_USE_CASE,
  useFactory: (repo: ProductRepository): FindProductByIdUseCase =>
    new FindProductByIdUseCase(repo),
  inject: [PRODUCT_REPOSITORY],
};

const updateProductUseCaseProvider = {
  provide: UPDATE_PRODUCT_USE_CASE,
  useFactory: (repo: ProductRepository): UpdateProductUseCase =>
    new UpdateProductUseCase(repo),
  inject: [PRODUCT_REPOSITORY],
};

const deleteProductUseCaseProvider = {
  provide: DELETE_PRODUCT_USE_CASE,
  useFactory: (repo: ProductRepository): DeleteProductUseCase =>
    new DeleteProductUseCase(repo),
  inject: [PRODUCT_REPOSITORY],
};

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
    createProductUseCaseProvider,
    findAllProductsUseCaseProvider,
    findProductByIdUseCaseProvider,
    updateProductUseCaseProvider,
    deleteProductUseCaseProvider,
    RolesGuard,
  ],
  exports: [PRODUCT_REPOSITORY, FIND_PRODUCT_BY_ID_USE_CASE],
})
export class ProductsModule {}
