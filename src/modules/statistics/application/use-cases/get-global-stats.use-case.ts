import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class GetGlobalStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    // 1. Órdenes agrupadas por estado
    const ordersByStatus = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // 2. Ingresos totales (solo órdenes entregadas)
    const totalRevenue = await this.prisma.order.aggregate({
      where: { status: 'DELIVERED' },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    // 3. Top 5 productos más vendidos
    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    // Obtener la info de cada producto del Top 5
    const productIds = topProducts.map((p) => p.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true, price: true, imageUrl: true },
    });

    const topProductsWithInfo = topProducts.map((tp) => {
      const product = products.find((p) => p.id === tp.productId);
      return {
        product,
        totalSold: tp._sum.quantity,
      };
    });

    // 4. Rendimiento por vendedor (órdenes entregadas por cada seller)
    const sellerPerformance = await this.prisma.order.groupBy({
      by: ['assignedSellerId'],
      where: { assignedSellerId: { not: null }, status: 'DELIVERED' },
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    // Obtener la info de cada vendedor
    const sellerIds = sellerPerformance
      .map((s) => s.assignedSellerId)
      .filter((id): id is string => id !== null);
    const sellers = await this.prisma.user.findMany({
      where: { id: { in: sellerIds } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    const sellerStats = sellerPerformance.map((sp) => {
      const seller = sellers.find((s) => s.id === sp.assignedSellerId);
      return {
        seller,
        ordersDelivered: sp._count.id,
        totalRevenue: sp._sum.totalAmount || 0,
      };
    });

    // 5. Totales generales
    const totalOrders = await this.prisma.order.count();
    const totalUsers = await this.prisma.user.count({ where: { role: 'USER' } });
    const totalProducts = await this.prisma.product.count({ where: { isActive: true } });

    // 6. Formatear respuesta
    const statusSummary: Record<string, number> = {};
    for (const group of ordersByStatus) {
      statusSummary[group.status] = group._count.id;
    }

    return {
      overview: {
        totalOrders,
        totalUsers,
        totalProducts,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalDelivered: totalRevenue._count.id,
      },
      ordersByStatus: statusSummary,
      topProducts: topProductsWithInfo,
      sellerPerformance: sellerStats,
    };
  }
}
