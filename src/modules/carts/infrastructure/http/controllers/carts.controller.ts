import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AddToCartUseCase } from '../../../application/add-to-cart.use-case';
import { GetCartUseCase } from '../../../application/get-cart.use-case';
import { UpdateCartItemUseCase } from '../../../application/update-cart-item.use-case';
import { RemoveCartItemUseCase } from '../../../application/remove-cart-item.use-case';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartsErrorInterceptor } from '../../carts-error.interceptor';

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
  async getCart(@Req() req: any) {
    const userId = req.user.id;
    return this.getCartUseCase.execute(userId);
  }

  @Post('items')
  async addItem(@Req() req: any, @Body() dto: AddToCartDto) {
    const userId = req.user.id;
    await this.addToCartUseCase.execute(userId, dto.productId, dto.quantity);
    return { success: true, message: 'Item added to cart' };
  }

  @Patch('items/:id')
  async updateItemQuantity(
    @Req() req: any,
    @Param('id') cartItemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const userId = req.user.id;
    await this.updateCartItemUseCase.execute(userId, cartItemId, dto.quantity);
    return { success: true, message: 'Cart item updated' };
  }

  @Delete('items/:id')
  async removeItem(@Param('id') cartItemId: string) {
    await this.removeCartItemUseCase.execute(cartItemId);
    return { success: true, message: 'Cart item removed' };
  }
}
