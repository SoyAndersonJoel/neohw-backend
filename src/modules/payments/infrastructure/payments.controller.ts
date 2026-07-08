import { Body, Controller, Post, Inject } from '@nestjs/common';
import { WebhookDto } from '../application/dtos/webhook.dto';
import { PROCESS_WEBHOOK_USE_CASE } from '../payments.tokens';
import type { ProcessWebhookUseCase } from '../application/use-cases/process-webhook.use-case';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject(PROCESS_WEBHOOK_USE_CASE)
    private readonly processWebhookUseCase: ProcessWebhookUseCase,
  ) {}

  // Nota: Un Webhook real no lleva JwtAuthGuard, porque quien hace la petición
  // es el servidor de Stripe/PayPal, no el navegador del usuario.
  // En producción, aquí se valida una firma (Signature) criptográfica.
  @Post('webhook')
  @ApiOperation({ summary: 'Manejar webhooks genéricos (Interno/Desarrollo)' })
  @ApiResponse({ status: 200, description: 'Webhook procesado' })
  async handleWebhook(@Body() dto: WebhookDto) {
    return this.processWebhookUseCase.execute(dto);
  }
}
