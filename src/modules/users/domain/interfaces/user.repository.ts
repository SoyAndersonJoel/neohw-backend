import { User } from '../entities/user.entity';
import { Role } from '../enums/role.enum';
import { AuthProvider } from '../enums/auth-provider.enum';

export type CreateUserParams = {
  email: string;
  passwordHash?: string | null;
  provider?: AuthProvider;
  providerId?: string | null;
  role: Role;
};

export interface UpdateUserParams {
  firstName?: string;
  lastName?: string;
  phone?: string;
  passwordHash?: string;
  isActive?: boolean;
}

export interface UserRepository {
  findAll(page: number, limit: number): Promise<{ users: User[]; total: number }>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserParams): Promise<User>;
  updateRole(id: string, role: Role): Promise<User>;
  update(id: string, data: UpdateUserParams): Promise<User>;
  softDelete(id: string): Promise<User>;
}
