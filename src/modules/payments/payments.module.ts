import { Module } from '@nestjs/common';
import { PaymentsController } from './infrastructure/payments.controller';
import { StripeController } from './infrastructure/stripe.controller';
import { ProcessWebhookUseCase } from './application/use-cases/process-webhook.use-case';
import { StripeService } from './application/services/stripe.service';
import { PROCESS_WEBHOOK_USE_CASE } from './payments.tokens';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController, StripeController],
  providers: [
    StripeService,
    ProcessWebhookUseCase, // Añadido directamente para que StripeController lo inyecte por tipo
    {
      provide: PROCESS_WEBHOOK_USE_CASE,
      useClass: ProcessWebhookUseCase,
    },
  ],
})
export class PaymentsModule {}
