import { CartRepository } from '../domain/cart.repository';
import { ProductRepository } from '../../products/domain/interfaces/product.repository';
import { InsufficientStockException } from '../domain/exceptions/insufficient-stock.exception';
import { ProductNotFoundException } from '../domain/exceptions/product-not-found.exception';
import { CartItemNotFoundException } from '../domain/exceptions/cart-item-not-found.exception';

export class UpdateCartItemUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(userId: string, cartItemId: string, quantity: number): Promise<void> {
    const cartItem = await this.cartRepository.findItemById(cartItemId);
    if (!cartItem) {
      throw new CartItemNotFoundException(cartItemId);
    }

    const product = await this.productRepository.findById(cartItem.productId);
    if (!product) {
      throw new ProductNotFoundException(cartItem.productId);
    }

    if (product.stock < quantity) {
      throw new InsufficientStockException(cartItem.productId, quantity, product.stock);
    }

    await this.cartRepository.updateItemQuantity(cartItemId, quantity);
  }
}
