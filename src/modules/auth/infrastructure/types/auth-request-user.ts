import { Role } from '../../../users/domain/enums/role.enum';

export type AccessRequestUser = {
  id: string;
  email: string;
  role: Role;
};

export type RefreshRequestUser = {
  userId: string;
  role: Role;
  tokenId: string;
  refreshToken: string;
};
