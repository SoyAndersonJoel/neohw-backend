import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class GetUserProjectsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const projects = await this.prisma.assemblyProject.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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

    return projects;
  }
}
