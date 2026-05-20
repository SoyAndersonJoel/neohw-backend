import { Module } from '@nestjs/common';
import { OrdersController } from './infrastructure/orders.controller';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { GetOrdersUseCase } from './application/use-cases/get-orders.use-case';
import { UpdateOrderStatusUseCase } from './application/use-cases/update-order-status.use-case';
import { OrderPaymentListener } from './infrastructure/listeners/order-payment.listener';
import { CREATE_ORDER_USE_CASE, GET_ORDERS_USE_CASE, UPDATE_ORDER_STATUS_USE_CASE } from './orders.tokens';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [
    OrderPaymentListener,
    {
      provide: CREATE_ORDER_USE_CASE,
      useClass: CreateOrderUseCase,
    },
    {
      provide: GET_ORDERS_USE_CASE,
      useClass: GetOrdersUseCase,
    },
    {
      provide: UPDATE_ORDER_STATUS_USE_CASE,
      useClass: UpdateOrderStatusUseCase,
    },
  ],
})
export class OrdersModule {}
