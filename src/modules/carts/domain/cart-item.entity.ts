export class CartItemEntity {
  constructor(
    public id: string,
    public cartId: string,
    public productId: string,
    public quantity: number,
    public createdAt: Date,
    public updatedAt: Date,
    public product?: any // Optional related product info
  ) {}
}
