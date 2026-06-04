import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { OrderStatus } from '../../../../generated/prisma/enums';

export interface GetOrdersParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  userRole?: string;
  userId?: string;
}

@Injectable()
export class GetOrdersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: GetOrdersParams) {
    const { status, page = 1, limit = 10, userRole, userId } = params;
    const skip = (page - 1) * limit;

    const where: any = status ? { status } : {};

    // Si es vendedor, solo puede ver las órdenes que le fueron asignadas por el sistema (o las PENDING_PAYMENT si le damos acceso a verlas, pero mejor solo las asignadas)
    if (userRole === 'SELLER') {
      where.assignedSellerId = userId;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, sku: true },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
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
