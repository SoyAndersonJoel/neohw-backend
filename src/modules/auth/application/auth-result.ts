import { User } from '../../users/domain/entities/user.entity';
import { Role } from '../../users/domain/enums/role.enum';

export type PublicUser = {
  id: string;
  email: string;
  role: Role;
};

export type AuthResult = {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
};

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  role: user.role,
});
