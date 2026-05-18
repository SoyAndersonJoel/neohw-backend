import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { ProductAttributeWithName } from '../../domain/entities/product-attribute.entity';
import {
  ProductAttributeRepository,
  SetProductAttributeParams,
} from '../../domain/interfaces/product-attribute.repository';

@Injectable()
export class PrismaProductAttributeRepository implements ProductAttributeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProductId(productId: string): Promise<ProductAttributeWithName[]> {
    const records = await this.prisma.productAttribute.findMany({
      where: { productId },
      include: {
        attribute: { select: { name: true, slug: true, unit: true } },
      },
      orderBy: { attribute: { name: 'asc' } },
    });

    return records.map((r) => this.toDomain(r));
  }

  async setAttributes(
    productId: string,
    attributes: SetProductAttributeParams[],
  ): Promise<ProductAttributeWithName[]> {
    // Usar transacción: crear/reemplazar todos los atributos enviados
    await this.prisma.$transaction(
      attributes.map((attr) =>
        this.prisma.productAttribute.upsert({
          where: {
            productId_attributeId: {
              productId,
              attributeId: attr.attributeId,
            },
          },
          create: {
            productId,
            attributeId: attr.attributeId,
            value: attr.value,
          },
          update: {
            value: attr.value,
          },
        }),
      ),
    );

    return this.findByProductId(productId);
  }

  async updateAttributes(
    productId: string,
    attributes: SetProductAttributeParams[],
  ): Promise<ProductAttributeWithName[]> {
    // Solo actualizar los atributos que ya existen o crear nuevos
    await this.prisma.$transaction(
      attributes.map((attr) =>
        this.prisma.productAttribute.upsert({
          where: {
            productId_attributeId: {
              productId,
              attributeId: attr.attributeId,
            },
          },
          create: {
            productId,
            attributeId: attr.attributeId,
            value: attr.value,
          },
          update: {
            value: attr.value,
          },
        }),
      ),
    );

    return this.findByProductId(productId);
  }

  private toDomain(record: any): ProductAttributeWithName {
    return {
      id: record.id,
      productId: record.productId,
      attributeId: record.attributeId,
      value: record.value,
      attributeName: record.attribute.name,
      attributeSlug: record.attribute.slug,
      unit: record.attribute.unit,
    };
  }
}
