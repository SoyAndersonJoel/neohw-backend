import { CartRepository } from '../domain/cart.repository';
import { ProductRepository } from '../../products/domain/interfaces/product.repository';
import { InsufficientStockException } from '../domain/exceptions/insufficient-stock.exception';

export class AddToCartUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(userId: string, productId: string, quantity: number): Promise<void> {
    // 1. Verificamos que el producto exista y tenga stock
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    if (product.stock < quantity) {
      throw new InsufficientStockException(productId, quantity, product.stock);
    }

    // 2. Obtenemos el carrito del usuario o lo creamos
    let cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      cart = await this.cartRepository.createCart(userId);
    }

    // 3. Verificamos si el item ya está en el carrito para sumar la cantidad y validar stock total
    const existingItem = cart.items.find(i => i.productId === productId);
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (product.stock < newQuantity) {
      throw new InsufficientStockException(productId, newQuantity, product.stock);
    }

    // 4. Agregamos el item (el repositorio debería manejar el "upsert")
    await this.cartRepository.addItem(cart.id, productId, quantity);
  }
}
