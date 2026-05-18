import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Category, CategoryWithChildren } from '../../domain/entities/category.entity';
import {
  CategoryRepository,
  CreateCategoryParams,
  UpdateCategoryParams,
} from '../../domain/interfaces/category.repository';

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  parentId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryWithChildren[]> {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      select: {
        ...categorySelect,
        children: { select: categorySelect, where: { isActive: true } },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((c) => this.toDomainWithChildren(c));
  }

  async findById(id: string): Promise<CategoryWithChildren | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: {
        ...categorySelect,
        children: { select: categorySelect, where: { isActive: true } },
      },
    });
    return category ? this.toDomainWithChildren(category) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      select: categorySelect,
    });
    return category ? this.toDomain(category) : null;
  }

  async create(data: CreateCategoryParams): Promise<Category> {
    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        parentId: data.parentId,
      },
      select: categorySelect,
    });
    return this.toDomain(category);
  }

  async update(id: string, data: UpdateCategoryParams): Promise<Category> {
    const category = await this.prisma.category.update({
      where: { id },
      data,
      select: categorySelect,
    });
    return this.toDomain(category);
  }

  async softDelete(id: string): Promise<Category> {
    const category = await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
      select: categorySelect,
    });
    return this.toDomain(category);
  }

  private toDomain(record: any): Category {
    return {
      id: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description,
      parentId: record.parentId,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toDomainWithChildren(record: any): CategoryWithChildren {
    return {
      ...this.toDomain(record),
      children: (record.children ?? []).map((c: any) => this.toDomain(c)),
    };
  }
}
