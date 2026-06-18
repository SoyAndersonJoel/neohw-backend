import { Test, TestingModule } from '@nestjs/testing';
import { StripeController } from './stripe.controller';
import { StripeService } from '../application/services/stripe.service';
import { ProcessWebhookUseCase } from '../application/use-cases/process-webhook.use-case';
import { BadRequestException } from '@nestjs/common';
import { mock, mockClear } from 'jest-mock-extended';

describe('StripeController', () => {
  let controller: StripeController;

  const stripeService = mock<StripeService>();
  const processWebhookUseCase = mock<ProcessWebhookUseCase>();

  beforeEach(async () => {
    mockClear(stripeService);
    mockClear(processWebhookUseCase);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeController],
      providers: [
        { provide: StripeService, useValue: stripeService },
        { provide: ProcessWebhookUseCase, useValue: processWebhookUseCase },
      ],
    }).compile();

    controller = module.get<StripeController>(StripeController);
  });

  describe('createSession', () => {
    it('should throw if orderId is not provided', async () => {
      await expect(controller.createSession(null as any)).rejects.toThrow(BadRequestException);
    });

    it('should call stripeService.createCheckoutSession', async () => {
      stripeService.createCheckoutSession.mockResolvedValue({ url: 'http://stripe.com' } as any);
      const result = await controller.createSession('order-1');
      expect(stripeService.createCheckoutSession).toHaveBeenCalled();
      expect(result).toEqual({ url: 'http://stripe.com' });
    });
  });

  describe('handleWebhook', () => {
    it('should throw if signature or rawBody is missing', async () => {
      await expect(controller.handleWebhook(null as any, { rawBody: Buffer.from('') } as any))
        .rejects.toThrow(BadRequestException);
      
      await expect(controller.handleWebhook('sig', { rawBody: null } as any))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw if signature verification fails', async () => {
      stripeService.constructEventFromPayload.mockImplementation(() => {
        throw new Error('Invalid sig');
      });

      await expect(controller.handleWebhook('bad-sig', { rawBody: Buffer.from('payload') } as any))
        .rejects.toThrow(new BadRequestException('Webhook signature verification failed: Invalid sig'));
    });

    it('should process checkout.session.completed event successfully', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { orderId: 'order-1' },
            payment_intent: 'pi_123',
            amount_total: 10000, // 100.00
          }
        }
      };

      stripeService.constructEventFromPayload.mockReturnValue(mockEvent as any);
      processWebhookUseCase.execute.mockResolvedValue({ message: 'OK' });

      const result = await controller.handleWebhook('good-sig', { rawBody: Buffer.from('payload') } as any);

      expect(processWebhookUseCase.execute).toHaveBeenCalledWith({
        orderId: 'order-1',
        transactionId: 'pi_123',
        amount: 100,
      });
      expect(result).toEqual({ received: true });
    });
  });
});
