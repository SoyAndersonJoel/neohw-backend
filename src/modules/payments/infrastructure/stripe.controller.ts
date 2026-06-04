import { Controller, Post, Body, Headers, Req, BadRequestException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from '../application/services/stripe.service';
import { ProcessWebhookUseCase } from '../application/use-cases/process-webhook.use-case';

@Controller('payments/stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly processWebhookUseCase: ProcessWebhookUseCase,
  ) {}

  @Post('create-checkout-session')
  async createSession(@Body('orderId') orderId: string) {
    if (!orderId) {
      throw new BadRequestException('El orderId es requerido');
    }

    // URLs a las que Stripe redirigirá al usuario después del pago
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/success?order_id=${orderId}`;
    const cancelUrl = `${baseUrl}/cancel?order_id=${orderId}`;

    return this.stripeService.createCheckoutSession(orderId, successUrl, cancelUrl);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    // El webhook de Stripe requiere el raw body (Buffer) para verificar la firma
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    let event;
    try {
      event = this.stripeService.constructEventFromPayload(signature, rawBody);
    } catch (err: any) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    // Procesar el evento
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId || session.client_reference_id;
      const transactionId = session.payment_intent; // Este es el ID único del cobro exitoso
      const amount = session.amount_total / 100; // Convertir de centavos a decimal normal

      if (orderId && transactionId) {
        // Enviar al caso de uso de webhook existente que ya tiene lógica de Idempotencia y Dominios
        await this.processWebhookUseCase.execute({
          orderId,
          transactionId,
          amount,
        });
      }
    }

    // Retornar 200 OK para decirle a Stripe que recibimos el evento
    return { received: true };
  }
}
