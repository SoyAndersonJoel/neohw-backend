import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { NotificationsService } from '../../../notifications/application/services/notifications.service';

@Injectable()
export class OrderPaymentListener {
  private readonly logger = new Logger(OrderPaymentListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent('payment.succeeded')
  async handlePaymentSucceededEvent(payload: { orderId: string }) {
    this.logger.log(`Recibido evento payment.succeeded para el pedido ${payload.orderId}`);

    try {
      const order = await this.prisma.order.update({
        where: { id: payload.orderId },
        data: { status: 'PROCESSING' },
        include: {
          user: true,
          items: {
            include: { product: true },
          },
        },
      });
      this.logger.log(`Pedido ${payload.orderId} actualizado a PROCESSING.`);

      // Enviar correo de factura al usuario
      const addressObj = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress;
      const formattedAddress = addressObj?.street ? `${addressObj.street}, ${addressObj.city || ''}` : 'Dirección principal';

      const orderData = {
        firstName: order.user.firstName || 'Cliente',
        trackingCode: order.trackingCode || order.id,
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.priceAtTime.toString(),
        })),
        subtotal: order.subtotal.toString(),
        taxAmount: order.taxAmount.toString(),
        totalAmount: order.totalAmount.toString(),
        shippingAddress: formattedAddress,
      };

      await this.notificationsService.sendOrderInvoiceEmail(order.user.email, orderData);
    } catch (error) {
      this.logger.error(`Error al actualizar el estado del pedido ${payload.orderId}`, error);
    }
  }
}
