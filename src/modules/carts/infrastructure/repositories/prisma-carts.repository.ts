import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CartRepository } from '../../domain/cart.repository';
import { CartEntity } from '../../domain/cart.entity';
import { CartItemEntity } from '../../domain/cart-item.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaCartsRepository implements CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(cartRecord: any): CartEntity {
    return new CartEntity(
      cartRecord.id,
      cartRecord.userId,
      cartRecord.createdAt,
      cartRecord.updatedAt,
      cartRecord.items?.map((item: any) => new CartItemEntity(
        item.id,
        item.cartId,
        item.productId,
        item.quantity,
        item.createdAt,
        item.updatedAt,
        item.product
      )) || []
    );
  }

  async findByUserId(userId: string): Promise<CartEntity | null> {
    const record = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!record) return null;
    return this.mapToEntity(record);
  }

  async createCart(userId: string): Promise<CartEntity> {
    const record = await this.prisma.cart.create({
      data: { userId },
      include: { items: true }
    });
    return this.mapToEntity(record);
  }

  async addItem(cartId: string, productId: string, quantity: number): Promise<CartItemEntity> {
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId,
        }
      }
    });

    let record;
    if (existingItem) {
      record = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      record = await this.prisma.cartItem.create({
        data: { cartId, productId, quantity }
      });
    }

    return new CartItemEntity(record.id, record.cartId, record.productId, record.quantity, record.createdAt, record.updatedAt);
  }

  async findItemById(cartItemId: string): Promise<CartItemEntity | null> {
    const record = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId }
    });
    if (!record) return null;
    return new CartItemEntity(record.id, record.cartId, record.productId, record.quantity, record.createdAt, record.updatedAt);
  }

  async updateItemQuantity(cartItemId: string, quantity: number): Promise<CartItemEntity> {
    const record = await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity }
    });
    return new CartItemEntity(record.id, record.cartId, record.productId, record.quantity, record.createdAt, record.updatedAt);
  }

  async removeItem(cartItemId: string): Promise<void> {
    await this.prisma.cartItem.delete({
      where: { id: cartItemId }
    });
  }

  async clearCart(cartId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: { cartId }
    });
  }
}
