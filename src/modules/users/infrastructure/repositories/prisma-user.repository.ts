import { Injectable } from '@nestjs/common';
import { Prisma, Role as PrismaRole } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { Role } from '../../domain/enums/role.enum';
import { AuthProvider } from '../../domain/enums/auth-provider.enum';
import {
  CreateUserParams,
  UpdateUserParams,
  UserRepository,
} from '../../domain/interfaces/user.repository';

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  passwordHash: true,
  provider: true,
  providerId: true,
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
        provider: data.provider,
        providerId: data.providerId,
        role: data.role as PrismaRole,
      },
      select: userSelect,
    });

    return this.toDomain(user);
  }

  async findAll(page: number, limit: number): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: userSelect,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users: users.map((u) => this.toDomain(u)),
      total,
    };
  }

  async updateRole(id: string, role: Role): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { role: role as PrismaRole },
      select: userSelect,
    });
    return this.toDomain(user);
  }

  async update(id: string, data: UpdateUserParams): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
    return this.toDomain(user);
  }

  async softDelete(id: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: userSelect,
    });
    return this.toDomain(user);
  }

  private toDomain(user: UserRecord): User {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      passwordHash: user.passwordHash,
      provider: user.provider as AuthProvider,
      providerId: user.providerId,
      role: user.role as Role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
