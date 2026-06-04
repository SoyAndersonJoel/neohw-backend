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
    // 1. Verificar idempotencia real: si el pago ya existe por su transactionId único, se corta aquí.
    const existingPayment = await this.prisma.payment.findUnique({
      where: { providerTransactionId: dto.transactionId },
    });

    if (existingPayment) {
      return { message: 'Pago ya fue procesado anteriormente (Idempotencia)' };
    }

    // 2. Verificar que el pedido existe
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new BadRequestException('Pedido no encontrado');
    }

    if (order.status !== 'PENDING_PAYMENT') {
      // Ocurre si ya fue procesado o cancelado. Registramos el pago igual por seguridad contable
      console.warn(`Webhook recibido para orden en estado ${order.status}`);
    }

    // 3. Ejecutar transacción ACID para asegurar que el pago y el estado cambien al mismo tiempo
    await this.prisma.$transaction(async (tx: any) => {
      await tx.payment.create({
        data: {
          orderId: order.id,
          provider: 'STRIPE',
          providerTransactionId: dto.transactionId,
          status: 'SUCCEEDED',
          amount: dto.amount, // Debe coincidir con order.totalAmount
        },
      });

      // Solo actualizamos a PROCESSING si estaba PENDING_PAYMENT
      if (order.status === 'PENDING_PAYMENT') {
        
        // --- INICIO ALGORITMO PUSH (Equidad Least-Loaded) ---
        // 1. Buscamos a todos los vendedores activos y contamos cuántas órdenes tienen "PROCESSING"
        const sellers = await tx.user.findMany({
          where: { role: 'SELLER', isActive: true },
          select: { 
            id: true, 
            _count: { select: { assignedOrders: { where: { status: 'PROCESSING' } } } } 
          },
        });

        let assignedSellerId = null;
        if (sellers.length > 0) {
          // 2. Ordenamos de menor a mayor carga de trabajo
          sellers.sort((a: any, b: any) => a._count.assignedOrders - b._count.assignedOrders);
          
          // 3. Seleccionamos al primero (el más desocupado)
          assignedSellerId = sellers[0].id;
        }
        // --- FIN ALGORITMO ---

        await tx.order.update({
          where: { id: order.id },
          data: { 
            status: 'PROCESSING',
            assignedSellerId: assignedSellerId 
          },
        });
      }
    });

    // 4. Emitir evento asíncrono si alguien necesita enviar un correo (desacoplado)
    this.eventEmitter.emit('payment.succeeded', { orderId: order.id });

    return { message: 'Webhook procesado exitosamente' };
  }
}
