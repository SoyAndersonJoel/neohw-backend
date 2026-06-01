import { CartRepository } from '../domain/cart.repository';
import { CartEntity } from '../domain/cart.entity';

export class GetCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(userId: string): Promise<CartEntity> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      return this.cartRepository.createCart(userId);
    }
    return cart;
  }
}
