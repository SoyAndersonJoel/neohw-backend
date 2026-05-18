import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Attribute, AttributeDataType } from '../../domain/entities/attribute.entity';
import {
  AttributeRepository,
  CreateAttributeParams,
  UpdateAttributeParams,
} from '../../domain/interfaces/attribute.repository';

const attributeSelect = {
  id: true,
  name: true,
  slug: true,
  dataType: true,
  unit: true,
  isFilterable: true,
  isRequired: true,
  options: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PrismaAttributeRepository implements AttributeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Attribute[]> {
    const attributes = await this.prisma.attribute.findMany({
      select: attributeSelect,
      orderBy: { name: 'asc' },
    });
    return attributes.map((a) => this.toDomain(a));
  }

  async findById(id: string): Promise<Attribute | null> {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id },
      select: attributeSelect,
    });
    return attribute ? this.toDomain(attribute) : null;
  }

  async findBySlug(slug: string): Promise<Attribute | null> {
    const attribute = await this.prisma.attribute.findUnique({
      where: { slug },
      select: attributeSelect,
    });
    return attribute ? this.toDomain(attribute) : null;
  }

  async findByCategoryId(categoryId: string): Promise<Attribute[]> {
    const categoryAttributes = await this.prisma.categoryAttribute.findMany({
      where: { categoryId },
      include: { attribute: { select: attributeSelect } },
    });
    return categoryAttributes.map((ca) => this.toDomain(ca.attribute));
  }

  async create(data: CreateAttributeParams): Promise<Attribute> {
    const attribute = await this.prisma.attribute.create({
      data: {
        name: data.name,
        slug: data.slug,
        dataType: data.dataType,
        unit: data.unit,
        isFilterable: data.isFilterable,
        isRequired: data.isRequired,
        options: data.options ?? undefined,
      },
      select: attributeSelect,
    });
    return this.toDomain(attribute);
  }

  async update(id: string, data: UpdateAttributeParams): Promise<Attribute> {
    const attribute = await this.prisma.attribute.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        dataType: data.dataType,
        unit: data.unit,
        isFilterable: data.isFilterable,
        isRequired: data.isRequired,
        options: data.options !== undefined ? (data.options ?? undefined) : undefined,
      },
      select: attributeSelect,
    });
    return this.toDomain(attribute);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.attribute.delete({ where: { id } });
  }

  async assignToCategory(categoryId: string, attributeId: string): Promise<void> {
    await this.prisma.categoryAttribute.upsert({
      where: { categoryId_attributeId: { categoryId, attributeId } },
      create: { categoryId, attributeId },
      update: {},
    });
  }

  async removeFromCategory(categoryId: string, attributeId: string): Promise<void> {
    await this.prisma.categoryAttribute.delete({
      where: { categoryId_attributeId: { categoryId, attributeId } },
    });
  }

  private toDomain(record: any): Attribute {
    return {
      id: record.id,
      name: record.name,
      slug: record.slug,
      dataType: record.dataType as AttributeDataType,
      unit: record.unit,
      isFilterable: record.isFilterable,
      isRequired: record.isRequired,
      options: record.options as string[] | null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
