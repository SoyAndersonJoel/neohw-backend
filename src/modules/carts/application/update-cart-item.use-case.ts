import { CartRepository } from '../domain/cart.repository';
import { ProductRepository } from '../../products/domain/interfaces/product.repository';
import { InsufficientStockException } from '../domain/exceptions/insufficient-stock.exception';

export class UpdateCartItemUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(userId: string, cartItemId: string, quantity: number): Promise<void> {
    const cartItem = await this.cartRepository.findItemById(cartItemId);
    if (!cartItem) {
      throw new Error(`Cart item with ID ${cartItemId} not found`);
    }

    const product = await this.productRepository.findById(cartItem.productId);
    if (!product) {
      throw new Error(`Product with ID ${cartItem.productId} not found`);
    }

    if (product.stock < quantity) {
      throw new InsufficientStockException(cartItem.productId, quantity, product.stock);
    }

    await this.cartRepository.updateItemQuantity(cartItemId, quantity);
  }
}
