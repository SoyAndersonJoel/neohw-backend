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

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserParams): Promise<User>;
}
