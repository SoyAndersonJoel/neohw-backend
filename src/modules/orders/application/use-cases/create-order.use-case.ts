import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CreateOrderDto } from '../dtos/create-order.dto';

@Injectable()
export class CreateOrderUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, dto: CreateOrderDto) {
    // 1. Iniciar una transacción ACID en Prisma
    return this.prisma.$transaction(async (tx: any) => {
      let totalAmount = 0;
      const orderItemsData = [];

      // 2. Procesar cada item del pedido
      for (const item of dto.items) {
        // Bloquear el producto temporalmente (opcional en PostgreSQL puro, pero Prisma lo maneja en memoria aquí)
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new BadRequestException(`Producto no encontrado: ${item.productId}`);
        }
        if (!product.isActive) {
          throw new BadRequestException(`Producto inactivo: ${product.name}`);
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Stock insuficiente para: ${product.name}`);
        }

        // 3. Descontar inventario inmediatamente
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });

        const lineTotal = Number(product.price) * item.quantity;
        totalAmount += lineTotal;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          priceAtTime: product.price,
        });
      }

      // 4. Crear la cabecera del pedido
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

      return order;
    });
  }
}
