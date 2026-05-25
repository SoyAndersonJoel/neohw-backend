import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: any; // Using any to avoid namespace type conflict
  private webhookSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secretKey = this.configService.get<string>('stripe.secretKey');
    this.webhookSecret = this.configService.get<string>('stripe.webhookSecret') || '';

    if (!secretKey) {
      console.warn('Stripe Secret Key is missing. Payments will fail.');
    }

    this.stripe = new Stripe(secretKey || '', {
      apiVersion: '2026-04-22.dahlia' as any, // Ignoramos el chequeo estricto
    });
  }

  /**
   * Crea una sesión de Checkout en Stripe de forma segura e idempotente.
   */
  async createCheckoutSession(orderId: string, successUrl: string, cancelUrl: string) {
    // 1. Obtener la orden de la base de datos (Nunca confiar en el frontend)
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('Orden no encontrada');
    }

    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException(`La orden ya tiene un estado de: ${order.status}`);
    }

    // 2. Convertir el monto a centavos (Stripe requiere montos en enteros)
    const amountInCents = Math.round(Number(order.totalAmount) * 100);

    try {
      // 3. Llamar a Stripe usando Idempotency Key
      const session = await this.stripe.checkout.sessions.create(
        {
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: 'usd', // Asumimos USD para NeoHW
                product_data: {
                  name: `Pedido NeoHW #${order.id.slice(0, 8)}`,
                  description: 'Compra de hardware',
                },
                unit_amount: amountInCents,
              },
              quantity: 1,
            },
          ],
          client_reference_id: order.id,
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            orderId: order.id,
          },
        },
        {
          // Idempotency Key previene cobros dobles si el usuario hace muchos clicks
          idempotencyKey: `checkout_session_${order.id}`,
        },
      );

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error: any) {
      console.error('Error creating Stripe session:', error);
      throw new InternalServerErrorException('Error al comunicarse con la pasarela de pagos');
    }
  }

  /**
   * Verifica la firma del Webhook usando el secret de Stripe
   */
  constructEventFromPayload(signature: string, payload: Buffer): any {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    } catch (err: any) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}
