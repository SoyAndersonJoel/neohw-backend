import { CartItemEntity } from './cart-item.entity';

export class CartEntity {
  constructor(
    public id: string,
    public userId: string,
    public createdAt: Date,
    public updatedAt: Date,
    public items: CartItemEntity[] = []
  ) {}

  public get totalItems(): number {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  // Helper method to add or update item
  public addItem(item: CartItemEntity): void {
    const existingItem = this.items.find(i => i.productId === item.productId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.items.push(item);
    }
  }
}
