import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CreateOrderFromCartDto } from '../dtos/create-order-from-cart.dto';

@Injectable()
export class CreateOrderFromCartUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, dto: CreateOrderFromCartDto) {
    return this.prisma.$transaction(async (tx: any) => {
      // 1. Obtener el carrito del usuario con sus items y productos
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('El carrito está vacío. Agrega productos antes de crear un pedido.');
      }

      let totalAmount = 0;
      const orderItemsData = [];

      // 2. Validar stock y preparar items del pedido
      for (const cartItem of cart.items) {
        const product = cartItem.product;

        if (!product) {
          throw new BadRequestException(`Producto no encontrado: ${cartItem.productId}`);
        }
        if (!product.isActive) {
          throw new BadRequestException(`Producto inactivo: ${product.name}`);
        }
        if (product.stock < cartItem.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para: ${product.name}. Disponible: ${product.stock}, Solicitado: ${cartItem.quantity}`,
          );
        }

        // 3. Descontar inventario
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - cartItem.quantity },
        });

        const lineTotal = Number(product.price) * cartItem.quantity;
        totalAmount += lineTotal;

        orderItemsData.push({
          productId: product.id,
          quantity: cartItem.quantity,
          priceAtTime: product.price,
        });
      }

      // 4. Crear la orden
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          shippingAddress: dto.shippingAddress,
          status: 'PENDING_PAYMENT',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // 5. Vaciar el carrito automáticamente
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });
  }
}
