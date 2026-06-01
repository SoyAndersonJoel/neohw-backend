import { CartEntity } from './cart.entity';
import { CartItemEntity } from './cart-item.entity';

export interface CartRepository {
  findByUserId(userId: string): Promise<CartEntity | null>;
  createCart(userId: string): Promise<CartEntity>;
  addItem(cartId: string, productId: string, quantity: number): Promise<CartItemEntity>;
  findItemById(cartItemId: string): Promise<CartItemEntity | null>;
  updateItemQuantity(cartItemId: string, quantity: number): Promise<CartItemEntity>;
  removeItem(cartItemId: string): Promise<void>;
  clearCart(cartId: string): Promise<void>;
}
