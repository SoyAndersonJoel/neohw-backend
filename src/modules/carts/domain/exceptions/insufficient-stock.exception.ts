export class InsufficientStockException extends Error {
  constructor(public readonly productId: string, public readonly requested: number, public readonly available: number) {
    super(`Insufficient stock for product ${productId}. Requested: ${requested}, Available: ${available}`);
    this.name = 'InsufficientStockException';
  }
}
