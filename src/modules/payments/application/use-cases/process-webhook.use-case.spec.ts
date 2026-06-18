import { ProcessWebhookUseCase } from './process-webhook.use-case';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException } from '@nestjs/common';
import { mock, mockClear } from 'jest-mock-extended';

describe('ProcessWebhookUseCase', () => {
  const prisma = mock<PrismaService>();
  prisma.payment = { findUnique: jest.fn(), create: jest.fn() } as any;
  prisma.order = { findUnique: jest.fn(), update: jest.fn() } as any;
  prisma.$transaction = jest.fn() as any;

  const eventEmitter = mock<EventEmitter2>();

  let useCase: ProcessWebhookUseCase;

  beforeEach(() => {
    mockClear(prisma);
    mockClear(eventEmitter);
    (prisma.payment.findUnique as jest.Mock).mockClear();
    (prisma.payment.create as jest.Mock).mockClear();
    (prisma.order.findUnique as jest.Mock).mockClear();
    (prisma.order.update as jest.Mock).mockClear();
    (prisma.$transaction as jest.Mock).mockClear();
    
    useCase = new ProcessWebhookUseCase(prisma, eventEmitter);
  });

  it('should return immediately if payment already exists (Idempotency)', async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue({ id: 'pay-1' } as any);

    const result = await useCase.execute({
      orderId: 'order-1',
      transactionId: 'tx-1',
      amount: 100,
    });

    expect(result).toEqual({ message: 'Pago ya fue procesado anteriormente (Idempotencia)' });
    expect(prisma.order.findUnique).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if order does not exist', async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute({
      orderId: 'order-1',
      transactionId: 'tx-1',
      amount: 100,
    })).rejects.toThrow(new BadRequestException('Pedido no encontrado'));
  });

  it('should process payment and assign seller if order is PENDING_PAYMENT', async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.order.findUnique as jest.Mock).mockResolvedValue({ id: 'order-1', status: 'PENDING_PAYMENT' } as any);

    const txMock = {
      payment: { create: jest.fn() },
      user: { findMany: jest.fn().mockResolvedValue([{ id: 'seller-1', _count: { assignedOrders: 0 } }]) },
      order: { update: jest.fn() },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      return cb(txMock);
    });

    const result = await useCase.execute({
      orderId: 'order-1',
      transactionId: 'tx-1',
      amount: 100,
    });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(txMock.payment.create).toHaveBeenCalledWith({
      data: {
        orderId: 'order-1',
        provider: 'STRIPE',
        providerTransactionId: 'tx-1',
        status: 'SUCCEEDED',
        amount: 100,
      },
    });
    expect(txMock.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'PROCESSING', assignedSellerId: 'seller-1' },
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith('payment.succeeded', { orderId: 'order-1' });
    expect(result).toEqual({ message: 'Webhook procesado exitosamente' });
  });
});
