import { PublicUser } from '../../application/auth-result';

export class AuthResponseDto {
  accessToken: string;
  user: PublicUser;
}
