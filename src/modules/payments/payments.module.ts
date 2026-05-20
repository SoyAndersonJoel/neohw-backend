import { Module } from '@nestjs/common';
import { PaymentsController } from './infrastructure/payments.controller';
import { ProcessWebhookUseCase } from './application/use-cases/process-webhook.use-case';
import { PROCESS_WEBHOOK_USE_CASE } from './payments.tokens';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [
    {
      provide: PROCESS_WEBHOOK_USE_CASE,
      useClass: ProcessWebhookUseCase,
    },
  ],
})
export class PaymentsModule {}
