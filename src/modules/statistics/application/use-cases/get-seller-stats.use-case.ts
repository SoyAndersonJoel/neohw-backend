import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class GetSellerStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(sellerId: string) {
    // 1. Contar las órdenes asignadas a este vendedor agrupadas por estado
    const ordersByStatus = await this.prisma.order.groupBy({
      by: ['status'],
      where: { assignedSellerId: sellerId },
      _count: { id: true },
    });

    // 2. Calcular el monto total de las órdenes ENTREGADAS por este vendedor
    const deliveredRevenue = await this.prisma.order.aggregate({
      where: { assignedSellerId: sellerId, status: 'DELIVERED' },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    // 3. Contar las órdenes pendientes de atender (PROCESSING)
    const pendingCount = await this.prisma.order.count({
      where: { assignedSellerId: sellerId, status: 'PROCESSING' },
    });

    // 4. Formatear la respuesta
    const statusSummary: Record<string, number> = {};
    for (const group of ordersByStatus) {
      statusSummary[group.status] = group._count.id;
    }

    return {
      sellerId,
      totalOrdersAssigned: Object.values(statusSummary).reduce((a, b) => a + b, 0),
      ordersByStatus: statusSummary,
      pendingOrders: pendingCount,
      totalRevenue: deliveredRevenue._sum.totalAmount || 0,
      totalDelivered: deliveredRevenue._count.id,
    };
  }
}
