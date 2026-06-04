import { Module } from '@nestjs/common';
import { OrdersController } from './infrastructure/orders.controller';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { CreateOrderFromCartUseCase } from './application/use-cases/create-order-from-cart.use-case';
import { GetOrdersUseCase } from './application/use-cases/get-orders.use-case';
import { UpdateOrderStatusUseCase } from './application/use-cases/update-order-status.use-case';
import { UploadOrderDocumentUseCase } from './application/use-cases/upload-order-document.use-case';
import { GetMyOrdersUseCase } from './application/use-cases/get-my-orders.use-case';
import { OrderPaymentListener } from './infrastructure/listeners/order-payment.listener';
import {
  CREATE_ORDER_USE_CASE,
  CREATE_ORDER_FROM_CART_USE_CASE,
  GET_ORDERS_USE_CASE,
  UPDATE_ORDER_STATUS_USE_CASE,
  UPLOAD_ORDER_DOCUMENT_USE_CASE,
  GET_MY_ORDERS_USE_CASE,
} from './orders.tokens';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [OrdersController],
  providers: [
    OrderPaymentListener,
    {
      provide: CREATE_ORDER_USE_CASE,
      useClass: CreateOrderUseCase,
    },
    {
      provide: CREATE_ORDER_FROM_CART_USE_CASE,
      useClass: CreateOrderFromCartUseCase,
    },
    {
      provide: GET_ORDERS_USE_CASE,
      useClass: GetOrdersUseCase,
    },
    {
      provide: UPDATE_ORDER_STATUS_USE_CASE,
      useClass: UpdateOrderStatusUseCase,
    },
    {
      provide: UPLOAD_ORDER_DOCUMENT_USE_CASE,
      useClass: UploadOrderDocumentUseCase,
    },
    {
      provide: GET_MY_ORDERS_USE_CASE,
      useClass: GetMyOrdersUseCase,
    },
  ],
})
export class OrdersModule {}
