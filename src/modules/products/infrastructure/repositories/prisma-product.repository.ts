import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Product, ProductWithDetails } from '../../domain/entities/product.entity';
import {
  CreateProductParams,
  PaginatedProducts,
  ProductQueryOptions,
  ProductRepository,
  UpdateProductParams,
} from '../../domain/interfaces/product.repository';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: ProductQueryOptions): Promise<PaginatedProducts> {
    const { filters, page, limit, sort, order } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { isActive: true };

    if (filters.category) {
      where.category = { slug: filters.category };
    }
    if (filters.brand) {
      where.brand = { equals: filters.brand, mode: 'insensitive' };
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }
    if (filters.sellerId) {
      where.sellerId = filters.sellerId;
    }

    // Filtros dinámicos por atributos
    if (filters.attributeFilters && Object.keys(filters.attributeFilters).length > 0) {
      where.AND = Object.entries(filters.attributeFilters).map(([slug, value]) => ({
        attributes: {
          some: {
            attribute: { slug },
            value: { equals: value, mode: 'insensitive' as const },
          },
        },
      }));
    }

    // Motor de búsqueda con fallback inteligente: AND primero, OR si no hay resultados
    if (filters.search) {
      const words = filters.search.trim().split(/\s+/).filter(Boolean);

      if (words.length === 1) {
        where.OR = [
          { name: { contains: words[0], mode: 'insensitive' } },
          { description: { contains: words[0], mode: 'insensitive' } },
          { brand: { contains: words[0], mode: 'insensitive' } },
        ];
      } else {
        // Estrategia: Intentar AND primero (más preciso), luego OR como fallback
        const andConditions = words.map((word) => ({
          OR: [
            { name: { contains: word, mode: 'insensitive' as const } },
            { description: { contains: word, mode: 'insensitive' as const } },
            { brand: { contains: word, mode: 'insensitive' as const } },
          ],
        }));

        // Combinar con AND existentes (attributeFilters) si los hay
        const existingAnd = where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : [];
        where.AND = [...existingAnd, ...andConditions];

        // Consulta rápida para saber si AND devuelve resultados
        const andCount = await this.prisma.product.count({ where });

        if (andCount === 0) {
          // Fallback: quitar las condiciones AND de búsqueda y usar OR (más amplio)
          where.AND = existingAnd.length > 0 ? existingAnd : undefined;
          where.OR = words.flatMap((word) => [
            { name: { contains: word, mode: 'insensitive' as const } },
            { description: { contains: word, mode: 'insensitive' as const } },
            { brand: { contains: word, mode: 'insensitive' as const } },
          ]);
        }
      }
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sort === 'price' || sort === 'name' || sort === 'createdAt' || sort === 'stock') {
      orderBy[sort] = order;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          attributes: {
            include: { attribute: { select: { name: true, unit: true } } },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => this.toDomainWithDetails(p)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<ProductWithDetails | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        attributes: {
          include: { attribute: { select: { name: true, unit: true } } },
        },
      },
    });
    return product ? this.toDomainWithDetails(product) : null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
    });
    return product ? this.toDomain(product) : null;
  }

  async create(data: CreateProductParams): Promise<Product> {
    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        brand: data.brand,
        model: data.model,
        sku: data.sku,
        price: data.price,
        stock: data.stock ?? 0,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        sellerId: data.sellerId,
      },
    });
    return this.toDomain(product);
  }

  async update(id: string, data: UpdateProductParams): Promise<Product> {
    const product = await this.prisma.product.update({
      where: { id },
      data,
    });
    return this.toDomain(product);
  }

  async softDelete(id: string): Promise<Product> {
    const product = await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    return this.toDomain(product);
  }

  private toDomain(record: any): Product {
    return {
      id: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description,
      brand: record.brand,
      model: record.model,
      sku: record.sku,
      price: Number(record.price),
      stock: record.stock,
      imageUrl: record.imageUrl,
      categoryId: record.categoryId,
      sellerId: record.sellerId,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toDomainWithDetails(record: any): ProductWithDetails {
    return {
      ...this.toDomain(record),
      category: {
        id: record.category.id,
        name: record.category.name,
        slug: record.category.slug,
      },
      attributes: (record.attributes ?? []).map((pa: any) => ({
        name: pa.attribute.name,
        value: pa.value,
        unit: pa.attribute.unit,
      })),
    };
  }
}
