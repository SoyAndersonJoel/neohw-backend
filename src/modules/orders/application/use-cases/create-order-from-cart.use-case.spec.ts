import { CreateOrderFromCartUseCase } from './create-order-from-cart.use-case';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('CreateOrderFromCartUseCase', () => {
  let useCase: CreateOrderFromCartUseCase;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(() => {
    prismaMock = mockDeep<PrismaService>();
    
    // Simular el comportamiento de $transaction devolviendo el callback ejecutado con el mismo prismaMock
    prismaMock.$transaction.mockImplementation(async (callback: any) => {
      return callback(prismaMock);
    });

    useCase = new CreateOrderFromCartUseCase(prismaMock);
  });

  it('should throw BadRequestException if cart is empty', async () => {
    prismaMock.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      items: [],
    } as any);

    await expect(
      useCase.execute('user-1', { shippingAddress: '123 Fake St' })
    ).rejects.toThrow(new BadRequestException('El carrito está vacío. Agrega productos antes de crear un pedido.'));
  });

  it('should throw BadRequestException if product is not found in a cart item', async () => {
    prismaMock.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      items: [
        { productId: 'prod-1', quantity: 2, product: null },
      ],
    } as any);

    await expect(
      useCase.execute('user-1', { shippingAddress: '123 Fake St' })
    ).rejects.toThrow(new BadRequestException('Producto no encontrado: prod-1'));
  });

  it('should throw BadRequestException if product is inactive', async () => {
    prismaMock.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      items: [
        { 
          productId: 'prod-1', 
          quantity: 2, 
          product: { id: 'prod-1', name: 'RTX 3060', isActive: false } 
        },
      ],
    } as any);

    await expect(
      useCase.execute('user-1', { shippingAddress: '123 Fake St' })
    ).rejects.toThrow(new BadRequestException('Producto inactivo: RTX 3060'));
  });

  it('should throw BadRequestException if there is insufficient stock', async () => {
    prismaMock.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      items: [
        { 
          productId: 'prod-1', 
          quantity: 5, 
          product: { id: 'prod-1', name: 'RTX 3060', isActive: true, stock: 2, price: 300 } 
        },
      ],
    } as any);

    await expect(
      useCase.execute('user-1', { shippingAddress: '123 Fake St' })
    ).rejects.toThrow(new BadRequestException('Stock insuficiente para: RTX 3060. Disponible: 2, Solicitado: 5'));
  });

  it('should process order correctly on happy path', async () => {
    prismaMock.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      items: [
        { 
          productId: 'prod-1', 
          quantity: 2, 
          product: { id: 'prod-1', name: 'RTX 3060', isActive: true, stock: 5, price: 300 } 
        },
      ],
    } as any);

    const mockOrder = { id: 'order-1', totalAmount: 600, status: 'PENDING_PAYMENT' };
    prismaMock.order.create.mockResolvedValue(mockOrder as any);

    const result = await useCase.execute('user-1', { shippingAddress: '123 Fake St' });

    // 1. Debe descontar el inventario
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      data: { stock: 3 }, // 5 original - 2 solicitado
    });

    // 2. Debe crear la orden con el totalAmount correcto
    expect(prismaMock.order.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        totalAmount: 600, // 300 * 2
        shippingAddress: '123 Fake St',
        status: 'PENDING_PAYMENT',
        items: {
          create: [
            { productId: 'prod-1', quantity: 2, priceAtTime: 300 },
          ],
        },
      },
      include: { items: true },
    });

    // 3. Debe vaciar el carrito
    expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { cartId: 'cart-1' },
    });

    // 4. Retorna la orden creada
    expect(result).toEqual(mockOrder);
  });
});
