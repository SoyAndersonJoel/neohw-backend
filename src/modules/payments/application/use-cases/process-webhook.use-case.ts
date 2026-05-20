import { Injectable, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { WebhookDto } from '../dtos/webhook.dto';

@Injectable()
export class ProcessWebhookUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: WebhookDto) {
    // 1. Validar Idempotencia
    // Si ya existe un pago con este providerTransactionId que fue exitoso, lo ignoramos.
    const existingPayment = await this.prisma.payment.findUnique({
      where: { providerTransactionId: dto.transactionId },
    });

    if (existingPayment && existingPayment.status === 'SUCCEEDED') {
      return { message: 'Pago ya fue procesado anteriormente (Idempotencia)' };
    }

    // 2. Verificar que el pedido existe y está pendiente
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new BadRequestException('Pedido no encontrado');
    }

    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException(`El pedido ya tiene un estado de: ${order.status}`);
    }

    // 3. Registrar el pago en la base de datos
    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'MOCK',
        providerTransactionId: dto.transactionId,
        status: 'SUCCEEDED',
        amount: dto.amount,
      },
    });

    // 4. Emitir el evento de dominio (Arquitectura Event-Driven)
    // El módulo de Orders lo escuchará para actualizar el status.
    this.eventEmitter.emit('payment.succeeded', { orderId: order.id });

    return { message: 'Webhook procesado exitosamente' };
  }
}
