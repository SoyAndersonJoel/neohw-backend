import { Body, Controller, Post, Get, Patch, Param, Query, UseGuards, Request, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../../users/domain/enums/role.enum';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { CreateOrderDto } from '../application/dtos/create-order.dto';
import { UpdateOrderStatusDto } from '../application/dtos/update-order-status.dto';
import { CREATE_ORDER_USE_CASE, GET_ORDERS_USE_CASE, UPDATE_ORDER_STATUS_USE_CASE } from '../orders.tokens';
import type { CreateOrderUseCase } from '../application/use-cases/create-order.use-case';
import type { GetOrdersUseCase } from '../application/use-cases/get-orders.use-case';
import type { UpdateOrderStatusUseCase } from '../application/use-cases/update-order-status.use-case';
import { OrderStatus } from '../../../generated/prisma/enums';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(CREATE_ORDER_USE_CASE)
    private readonly createOrderUseCase: CreateOrderUseCase,
    @Inject(GET_ORDERS_USE_CASE)
    private readonly getOrdersUseCase: GetOrdersUseCase,
    @Inject(UPDATE_ORDER_STATUS_USE_CASE)
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createOrder(@Request() req: any, @Body() dto: CreateOrderDto) {
    const userId = req.user.id;
    const order = await this.createOrderUseCase.execute(userId, dto);
    return {
      message: 'Pedido creado exitosamente, pendiente de pago',
      orderId: order.id,
      totalAmount: order.totalAmount,
    };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SELLER)
  @Get()
  async getOrders(
    @Query('status') status?: OrderStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.getOrdersUseCase.execute({ status, page, limit });
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SELLER)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.updateOrderStatusUseCase.execute(id, dto.status as OrderStatus);
    return {
      message: `Estado del pedido actualizado a ${order.status}`,
      order,
    };
  }
}
