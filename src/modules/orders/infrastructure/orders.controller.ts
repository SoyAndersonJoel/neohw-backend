import { Body, Controller, Post, Get, Patch, Param, Query, UseGuards, Request, Inject, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../../users/domain/enums/role.enum';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { CreateOrderDto } from '../application/dtos/create-order.dto';
import { CreateOrderFromCartDto } from '../application/dtos/create-order-from-cart.dto';
import { UpdateOrderStatusDto } from '../application/dtos/update-order-status.dto';
import { CREATE_ORDER_USE_CASE, CREATE_ORDER_FROM_CART_USE_CASE, GET_ORDERS_USE_CASE, UPDATE_ORDER_STATUS_USE_CASE, UPLOAD_ORDER_DOCUMENT_USE_CASE, GET_MY_ORDERS_USE_CASE } from '../orders.tokens';
import type { CreateOrderUseCase } from '../application/use-cases/create-order.use-case';
import type { CreateOrderFromCartUseCase } from '../application/use-cases/create-order-from-cart.use-case';
import type { GetOrdersUseCase } from '../application/use-cases/get-orders.use-case';
import type { UpdateOrderStatusUseCase } from '../application/use-cases/update-order-status.use-case';
import type { UploadOrderDocumentUseCase } from '../application/use-cases/upload-order-document.use-case';
import type { GetMyOrdersUseCase } from '../application/use-cases/get-my-orders.use-case';
import { OrderStatus } from '../../../generated/prisma/enums';

// Configuración de Multer: filtro de formatos permitidos
const multerOptions = {
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException(`Formato no permitido: ${file.mimetype}. Solo se aceptan JPEG, PNG, WEBP y PDF`), false);
    }
  },
};

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(CREATE_ORDER_USE_CASE)
    private readonly createOrderUseCase: CreateOrderUseCase,
    @Inject(CREATE_ORDER_FROM_CART_USE_CASE)
    private readonly createOrderFromCartUseCase: CreateOrderFromCartUseCase,
    @Inject(GET_ORDERS_USE_CASE)
    private readonly getOrdersUseCase: GetOrdersUseCase,
    @Inject(UPDATE_ORDER_STATUS_USE_CASE)
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    @Inject(UPLOAD_ORDER_DOCUMENT_USE_CASE)
    private readonly uploadOrderDocumentUseCase: UploadOrderDocumentUseCase,
    @Inject(GET_MY_ORDERS_USE_CASE)
    private readonly getMyOrdersUseCase: GetMyOrdersUseCase,
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

  @UseGuards(AuthGuard('jwt'))
  @Post('from-cart')
  async createOrderFromCart(@Request() req: any, @Body() dto: CreateOrderFromCartDto) {
    const userId = req.user.id;
    const order = await this.createOrderFromCartUseCase.execute(userId, dto);
    return {
      message: 'Pedido creado desde el carrito exitosamente, pendiente de pago',
      orderId: order.id,
      totalAmount: order.totalAmount,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-orders')
  async getMyOrders(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.getMyOrdersUseCase.execute({
      userId: req.user.id,
      page,
      limit,
    });
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SELLER)
  @Get()
  async getOrders(
    @Request() req: any,
    @Query('status') status?: OrderStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.getOrdersUseCase.execute({ 
      status, 
      page, 
      limit, 
      userRole: req.user.role, 
      userId: req.user.id 
    });
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SELLER)
  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadDocument(
    @Param('id') id: string,
    @Body('documentType') documentType: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const document = await this.uploadOrderDocumentUseCase.execute(id, file, documentType as any);
    return {
      message: 'Documento subido exitosamente',
      document,
    };
  }
}

