import { CartRepository } from '../domain/cart.repository';

export class RemoveCartItemUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(cartItemId: string): Promise<void> {
    await this.cartRepository.removeItem(cartItemId);
  }
}
