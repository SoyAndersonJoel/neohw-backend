export class ProductNotFoundException extends Error {
  constructor(public readonly productId: string) {
    super(`Product with ID ${productId} not found`);
    this.name = 'ProductNotFoundException';
  }
}
