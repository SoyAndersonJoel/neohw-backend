import { Test, TestingModule } from '@nestjs/testing';
import { CartsController } from './carts.controller';
import { AddToCartUseCase } from '../../../application/add-to-cart.use-case';
import { GetCartUseCase } from '../../../application/get-cart.use-case';
import { UpdateCartItemUseCase } from '../../../application/update-cart-item.use-case';
import { RemoveCartItemUseCase } from '../../../application/remove-cart-item.use-case';
import { mock, mockClear } from 'jest-mock-extended';

describe('CartsController', () => {
  let controller: CartsController;

  const addToCartUseCase = mock<AddToCartUseCase>();
  const getCartUseCase = mock<GetCartUseCase>();
  const updateCartItemUseCase = mock<UpdateCartItemUseCase>();
  const removeCartItemUseCase = mock<RemoveCartItemUseCase>();

  beforeEach(async () => {
    mockClear(addToCartUseCase);
    mockClear(getCartUseCase);
    mockClear(updateCartItemUseCase);
    mockClear(removeCartItemUseCase);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartsController],
      providers: [
        { provide: AddToCartUseCase, useValue: addToCartUseCase },
        { provide: GetCartUseCase, useValue: getCartUseCase },
        { provide: UpdateCartItemUseCase, useValue: updateCartItemUseCase },
        { provide: RemoveCartItemUseCase, useValue: removeCartItemUseCase },
      ],
    }).compile();

    controller = module.get<CartsController>(CartsController);
  });

  describe('getCart', () => {
    it('should return user cart', async () => {
      const mockReq = { user: { id: 'user-1' } };
      const mockCart = { id: 'cart-1', items: [] };

      getCartUseCase.execute.mockResolvedValue(mockCart as any);

      const result = await controller.getCart(mockReq);

      expect(getCartUseCase.execute).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockCart);
    });
  });

  describe('addItem', () => {
    it('should call addToCartUseCase and return success', async () => {
      const mockReq = { user: { id: 'user-1' } };
      const dto = { productId: 'prod-1', quantity: 2 };

      addToCartUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.addItem(mockReq, dto);

      expect(addToCartUseCase.execute).toHaveBeenCalledWith('user-1', 'prod-1', 2);
      expect(result).toEqual({ success: true, message: 'Item added to cart' });
    });
  });

  describe('updateItemQuantity', () => {
    it('should call updateCartItemUseCase and return success', async () => {
      const mockReq = { user: { id: 'user-1' } };
      const dto = { quantity: 5 };

      updateCartItemUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.updateItemQuantity(mockReq, 'item-1', dto);

      expect(updateCartItemUseCase.execute).toHaveBeenCalledWith('user-1', 'item-1', 5);
      expect(result).toEqual({ success: true, message: 'Cart item updated' });
    });
  });

  describe('removeItem', () => {
    it('should call removeCartItemUseCase and return success', async () => {
      removeCartItemUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.removeItem('item-1');

      expect(removeCartItemUseCase.execute).toHaveBeenCalledWith('item-1');
      expect(result).toEqual({ success: true, message: 'Cart item removed' });
    });
  });
});
