import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class OrderPaymentListener {
  private readonly logger = new Logger(OrderPaymentListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('payment.succeeded')
  async handlePaymentSucceededEvent(payload: { orderId: string }) {
    this.logger.log(`Recibido evento payment.succeeded para el pedido ${payload.orderId}`);

    try {
      await this.prisma.order.update({
        where: { id: payload.orderId },
        data: { status: 'PROCESSING' },
      });
      this.logger.log(`Pedido ${payload.orderId} actualizado a PROCESSING.`);
    } catch (error) {
      this.logger.error(`Error al actualizar el estado del pedido ${payload.orderId}`, error);
    }
  }
}
