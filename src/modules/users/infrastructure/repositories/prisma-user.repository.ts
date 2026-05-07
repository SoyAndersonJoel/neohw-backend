import { Injectable } from '@nestjs/common';
import { Prisma, Role as PrismaRole } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { Role } from '../../domain/enums/role.enum';
import {
  CreateUserParams,
  UserRepository,
} from '../../domain/interfaces/user.repository';

const userSelect = {
  id: true,
  email: true,
  passwordHash: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

type UserRecord = Prisma.UserGetPayload<{ select: typeof userSelect }>;

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });
    return user ? this.toDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
    return user ? this.toDomain(user) : null;
  }

  async create(data: CreateUserParams): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role as PrismaRole,
      },
      select: userSelect,
    });

    return this.toDomain(user);
  }

  private toDomain(user: UserRecord): User {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role as Role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
