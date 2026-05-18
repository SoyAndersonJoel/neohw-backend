import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type { ProductAttributesFetcher } from '../../application/use-cases/check-compatibility.use-case';

/**
 * Implementación de ProductAttributesFetcher usando Prisma directamente.
 * Obtiene productos con sus atributos mapeados para el motor de compatibilidad.
 */
@Injectable()
export class PrismaProductAttributesFetcher implements ProductAttributesFetcher {
  constructor(private readonly prisma: PrismaService) {}

  async getProductsWithAttributes(
    productIds: string[],
  ): Promise<Array<{ id: string; name: string; attributes: Map<string, string> }>> {
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        attributes: {
          select: { attributeId: true, value: true },
        },
      },
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      attributes: new Map(p.attributes.map((a) => [a.attributeId, a.value])),
    }));
  }
}
