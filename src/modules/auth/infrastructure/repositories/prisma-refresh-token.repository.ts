import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import {
  CreateRefreshTokenParams,
  RefreshTokenRepository,
} from '../../domain/interfaces/refresh-token.repository';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRefreshTokenParams): Promise<void> {
    await this.prisma.refreshToken.create({ data });
  }

  async findById(id: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({ where: { id } });
  }

  async revoke(id: string, replacedByTokenId: string | null): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { id, revokedAt: null },
      data: {
        revokedAt: new Date(),
        replacedByTokenId,
      },
    });
  }
}
