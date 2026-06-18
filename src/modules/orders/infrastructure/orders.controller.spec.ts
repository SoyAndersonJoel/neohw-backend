import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { mock, mockClear } from 'jest-mock-extended';
import { Role } from '../../users/domain/enums/role.enum';
import { OrderStatus } from '../../../generated/prisma/enums';
import {
  CREATE_ORDER_USE_CASE,
  CREATE_ORDER_FROM_CART_USE_CASE,
  GET_ORDERS_USE_CASE,
  UPDATE_ORDER_STATUS_USE_CASE,
  UPLOAD_ORDER_DOCUMENT_USE_CASE,
  GET_MY_ORDERS_USE_CASE,
} from '../orders.tokens';

// Tipos de los casos de uso
import type { CreateOrderUseCase } from '../application/use-cases/create-order.use-case';
import type { CreateOrderFromCartUseCase } from '../application/use-cases/create-order-from-cart.use-case';
import type { GetOrdersUseCase } from '../application/use-cases/get-orders.use-case';
import type { UpdateOrderStatusUseCase } from '../application/use-cases/update-order-status.use-case';
import type { UploadOrderDocumentUseCase } from '../application/use-cases/upload-order-document.use-case';
import type { GetMyOrdersUseCase } from '../application/use-cases/get-my-orders.use-case';

describe('OrdersController', () => {
  let controller: OrdersController;

  const createOrderUseCase = mock<CreateOrderUseCase>();
  const createOrderFromCartUseCase = mock<CreateOrderFromCartUseCase>();
  const getOrdersUseCase = mock<GetOrdersUseCase>();
  const updateOrderStatusUseCase = mock<UpdateOrderStatusUseCase>();
  const uploadOrderDocumentUseCase = mock<UploadOrderDocumentUseCase>();
  const getMyOrdersUseCase = mock<GetMyOrdersUseCase>();

  beforeEach(async () => {
    mockClear(createOrderUseCase);
    mockClear(createOrderFromCartUseCase);
    mockClear(getOrdersUseCase);
    mockClear(updateOrderStatusUseCase);
    mockClear(uploadOrderDocumentUseCase);
    mockClear(getMyOrdersUseCase);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: CREATE_ORDER_USE_CASE, useValue: createOrderUseCase },
        { provide: CREATE_ORDER_FROM_CART_USE_CASE, useValue: createOrderFromCartUseCase },
        { provide: GET_ORDERS_USE_CASE, useValue: getOrdersUseCase },
        { provide: UPDATE_ORDER_STATUS_USE_CASE, useValue: updateOrderStatusUseCase },
        { provide: UPLOAD_ORDER_DOCUMENT_USE_CASE, useValue: uploadOrderDocumentUseCase },
        { provide: GET_MY_ORDERS_USE_CASE, useValue: getMyOrdersUseCase },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  describe('createOrderFromCart', () => {
    it('should call createOrderFromCartUseCase and return successful message', async () => {
      const mockReq = { user: { id: 'user-1' } };
      const mockDto = { shippingAddress: '123 Fake St' };
      const mockOrder = { id: 'order-1', totalAmount: 500 };

      createOrderFromCartUseCase.execute.mockResolvedValue(mockOrder as any);

      const result = await controller.createOrderFromCart(mockReq, mockDto);

      expect(createOrderFromCartUseCase.execute).toHaveBeenCalledWith('user-1', mockDto);
      expect(result).toEqual({
        message: 'Pedido creado desde el carrito exitosamente, pendiente de pago',
        orderId: 'order-1',
        totalAmount: 500,
      });
    });
  });

  describe('updateStatus', () => {
    it('should call updateOrderStatusUseCase and return updated order', async () => {
      const mockDto = { status: OrderStatus.SHIPPED };
      const mockOrder = { id: 'order-1', status: OrderStatus.SHIPPED };

      updateOrderStatusUseCase.execute.mockResolvedValue(mockOrder as any);

      const result = await controller.updateStatus('order-1', mockDto as any);

      expect(updateOrderStatusUseCase.execute).toHaveBeenCalledWith('order-1', OrderStatus.SHIPPED);
      expect(result).toEqual({
        message: `Estado del pedido actualizado a SHIPPED`,
        order: mockOrder,
      });
    });
  });

  describe('getOrders', () => {
    it('should call getOrdersUseCase with appropriate pagination and role', async () => {
      const mockReq = { user: { id: 'admin-1', role: Role.ADMIN } };
      const mockResult = { data: [], total: 0, page: 1, limit: 10 };

      getOrdersUseCase.execute.mockResolvedValue(mockResult as any);

      const result = await controller.getOrders(mockReq, OrderStatus.PENDING_PAYMENT, 1, 10);

      expect(getOrdersUseCase.execute).toHaveBeenCalledWith({
        status: OrderStatus.PENDING_PAYMENT,
        page: 1,
        limit: 10,
        userRole: Role.ADMIN,
        userId: 'admin-1',
      });
      expect(result).toEqual(mockResult);
    });
  });
});
