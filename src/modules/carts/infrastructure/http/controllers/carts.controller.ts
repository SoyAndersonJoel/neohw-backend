import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AddToCartUseCase } from '../../../application/add-to-cart.use-case';
import { GetCartUseCase } from '../../../application/get-cart.use-case';
import { UpdateCartItemUseCase } from '../../../application/update-cart-item.use-case';
import { RemoveCartItemUseCase } from '../../../application/remove-cart-item.use-case';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartsErrorInterceptor } from '../../carts-error.interceptor';

import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Carts')
@ApiBearerAuth()
@Controller('carts')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(CartsErrorInterceptor)
export class CartsController {
  constructor(
    private readonly addToCartUseCase: AddToCartUseCase,
    private readonly getCartUseCase: GetCartUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
    private readonly removeCartItemUseCase: RemoveCartItemUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener el carrito de compras del usuario actual' })
  @ApiResponse({ status: 200, description: 'Carrito obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getCart(@Req() req: any) {
    const userId = req.user.id;
    return this.getCartUseCase.execute(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Agregar un producto al carrito' })
  @ApiResponse({ status: 201, description: 'Producto agregado al carrito' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async addItem(@Req() req: any, @Body() dto: AddToCartDto) {
    const userId = req.user.id;
    await this.addToCartUseCase.execute(userId, dto.productId, dto.quantity);
    return { success: true, message: 'Item added to cart' };
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Actualizar la cantidad de un ítem en el carrito' })
  @ApiResponse({ status: 200, description: 'Cantidad actualizada' })
  @ApiResponse({ status: 404, description: 'Ítem no encontrado en el carrito' })
  async updateItemQuantity(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) cartItemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const userId = req.user.id;
    await this.updateCartItemUseCase.execute(userId, cartItemId, dto.quantity);
    return { success: true, message: 'Cart item updated' };
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Eliminar un ítem del carrito' })
  @ApiResponse({ status: 200, description: 'Ítem eliminado del carrito' })
  @ApiResponse({ status: 404, description: 'Ítem no encontrado' })
  async removeItem(@Param('id', ParseUUIDPipe) cartItemId: string) {
    await this.removeCartItemUseCase.execute(cartItemId);
    return { success: true, message: 'Cart item removed' };
  }
}

