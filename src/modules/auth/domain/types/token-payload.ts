import { Role } from '../../../users/domain/enums/role.enum';

export type TokenPayload = {
  sub: string;
  email: string;
  role: Role;
};

export type RefreshTokenPayload = TokenPayload & {
  tokenId: string;
};
