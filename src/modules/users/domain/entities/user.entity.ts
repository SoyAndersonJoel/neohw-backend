import { Role } from '../enums/role.enum';
import { AuthProvider } from '../enums/auth-provider.enum';

export type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  passwordHash: string | null;
  provider: AuthProvider;
  providerId: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
