import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { OrderStatus } from '../../../../generated/prisma/enums';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { documents: true },
    });

    if (!order) {
      throw new NotFoundException(`Pedido ${orderId} no encontrado`);
    }

    // Reglas de negocio:
    // 1. No se puede enviar un pedido que no ha sido procesado/pagado.
    if (status === 'SHIPPED' && order.status !== 'PROCESSING') {
      throw new BadRequestException('Solo se pueden enviar pedidos que están en PROCESSING');
    }

    // 2. Un pedido entregado o cancelado no debería cambiar de estado fácilmente
    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      throw new BadRequestException(`El pedido ya está en estado final: ${order.status}`);
    }

    // 3. Validación estricta de documentos según el nuevo estado
    if (status === 'SHIPPED') {
      const hasShippingProof = order.documents.some((d) => d.documentType === 'SHIPPING_PROOF');
      if (!hasShippingProof) {
        throw new BadRequestException(
          'Para cambiar el estado a SHIPPED, debe subir primero una prueba de envío (SHIPPING_PROOF)',
        );
      }
    }

    if (status === 'DELIVERED') {
      const hasDeliveryPhoto = order.documents.some((d) => d.documentType === 'DELIVERY_PHOTO');
      const hasCustomerSignature = order.documents.some((d) => d.documentType === 'CUSTOMER_SIGNATURE');

      if (!hasDeliveryPhoto || !hasCustomerSignature) {
        throw new BadRequestException(
          'Para cambiar el estado a DELIVERED, debe subir la foto de entrega (DELIVERY_PHOTO) y la firma del cliente (CUSTOMER_SIGNATURE)',
        );
      }
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return updatedOrder;
  }
}
