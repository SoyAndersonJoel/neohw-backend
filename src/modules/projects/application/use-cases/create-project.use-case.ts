import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CreateProjectDto } from '../dtos/create-project.dto';

@Injectable()
export class CreateProjectUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, dto: CreateProjectDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('El proyecto debe tener al menos un componente.');
    }

    // Verificar que los productos existan
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Uno o más productos no existen en el catálogo.');
    }

    // Crear el proyecto
    const project = await this.prisma.assemblyProject.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, sku: true, price: true, imageUrl: true },
            },
          },
        },
      },
    });

    return project;
  }
}
