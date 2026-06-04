import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

export interface GetMyOrdersParams {
  userId: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class GetMyOrdersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: GetMyOrdersParams) {
    const { userId, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, sku: true, imageUrl: true, price: true },
              },
            },
          },
          payments: {
            select: { status: true, provider: true, createdAt: true },
          },
        },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
