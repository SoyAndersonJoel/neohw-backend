import { Module } from '@nestjs/common';
import { CartsController } from './infrastructure/http/controllers/carts.controller';
import { PrismaCartsRepository } from './infrastructure/repositories/prisma-carts.repository';
import { CART_REPOSITORY } from './carts.tokens';
import { AddToCartUseCase } from './application/add-to-cart.use-case';
import { GetCartUseCase } from './application/get-cart.use-case';
import { UpdateCartItemUseCase } from './application/update-cart-item.use-case';
import { RemoveCartItemUseCase } from './application/remove-cart-item.use-case';
import { CartRepository } from './domain/cart.repository';
import { ProductsModule } from '../products/products.module';
import { PRODUCT_REPOSITORY } from '../products/products.tokens';
import { ProductRepository } from '../products/domain/interfaces/product.repository';

@Module({
  imports: [ProductsModule],
  controllers: [CartsController],
  providers: [
    {
      provide: CART_REPOSITORY,
      useClass: PrismaCartsRepository,
    },
    {
      provide: AddToCartUseCase,
      useFactory: (cartRepo: CartRepository, productRepo: ProductRepository) => new AddToCartUseCase(cartRepo, productRepo),
      inject: [CART_REPOSITORY, PRODUCT_REPOSITORY],
    },
    {
      provide: GetCartUseCase,
      useFactory: (cartRepo: CartRepository) => new GetCartUseCase(cartRepo),
      inject: [CART_REPOSITORY],
    },
    {
      provide: UpdateCartItemUseCase,
      useFactory: (cartRepo: CartRepository, productRepo: ProductRepository) => new UpdateCartItemUseCase(cartRepo, productRepo),
      inject: [CART_REPOSITORY, PRODUCT_REPOSITORY],
    },
    {
      provide: RemoveCartItemUseCase,
      useFactory: (cartRepo: CartRepository) => new RemoveCartItemUseCase(cartRepo),
      inject: [CART_REPOSITORY],
    },
  ],
  exports: [CART_REPOSITORY],
})
export class CartsModule {}
