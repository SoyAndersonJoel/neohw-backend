import { AddToCartUseCase } from './add-to-cart.use-case';
import { CartRepository } from '../domain/cart.repository';
import { ProductRepository } from '../../products/domain/interfaces/product.repository';
import { InsufficientStockException } from '../domain/exceptions/insufficient-stock.exception';
import { ProductNotFoundException } from '../domain/exceptions/product-not-found.exception';
import { mock, mockClear } from 'jest-mock-extended';

describe('AddToCartUseCase', () => {
  const cartRepository = mock<CartRepository>();
  const productRepository = mock<ProductRepository>();

  let useCase: AddToCartUseCase;

  beforeEach(() => {
    mockClear(cartRepository);
    mockClear(productRepository);
    useCase = new AddToCartUseCase(cartRepository, productRepository);
  });

  it('should throw ProductNotFoundException if product does not exist', async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 'prod-1', 2))
      .rejects.toThrow(new ProductNotFoundException('prod-1'));
  });

  it('should throw InsufficientStockException if initial request exceeds stock', async () => {
    productRepository.findById.mockResolvedValue({ id: 'prod-1', stock: 1 } as any);

    await expect(useCase.execute('user-1', 'prod-1', 2))
      .rejects.toThrow(new InsufficientStockException('prod-1', 2, 1));
  });

  it('should create cart if it does not exist and add item', async () => {
    productRepository.findById.mockResolvedValue({ id: 'prod-1', stock: 10 } as any);
    cartRepository.findByUserId.mockResolvedValue(null);
    cartRepository.createCart.mockResolvedValue({ id: 'cart-1', items: [] } as any);

    await useCase.execute('user-1', 'prod-1', 2);

    expect(cartRepository.createCart).toHaveBeenCalledWith('user-1');
    expect(cartRepository.addItem).toHaveBeenCalledWith('cart-1', 'prod-1', 2);
  });

  it('should throw InsufficientStockException if adding to existing cart item exceeds stock', async () => {
    productRepository.findById.mockResolvedValue({ id: 'prod-1', stock: 5 } as any);
    cartRepository.findByUserId.mockResolvedValue({
      id: 'cart-1',
      items: [{ productId: 'prod-1', quantity: 4 }],
    } as any);

    await expect(useCase.execute('user-1', 'prod-1', 2))
      .rejects.toThrow(new InsufficientStockException('prod-1', 6, 5));
  });

  it('should add item if cart exists and combined stock is valid', async () => {
    productRepository.findById.mockResolvedValue({ id: 'prod-1', stock: 10 } as any);
    cartRepository.findByUserId.mockResolvedValue({
      id: 'cart-1',
      items: [{ productId: 'prod-1', quantity: 4 }],
    } as any);

    await useCase.execute('user-1', 'prod-1', 2);

    // newQuantity is 6, which is <= 10. Valid!
    expect(cartRepository.addItem).toHaveBeenCalledWith('cart-1', 'prod-1', 2);
  });
});
