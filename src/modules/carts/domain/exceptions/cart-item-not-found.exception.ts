export class CartItemNotFoundException extends Error {
  constructor(public readonly cartItemId: string) {
    super(`Cart item with ID ${cartItemId} not found`);
    this.name = 'CartItemNotFoundException';
  }
}
