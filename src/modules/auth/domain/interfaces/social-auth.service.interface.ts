import { SocialUser } from '../types/social-user';

export interface ISocialAuthService {
  verifyToken(token: string): Promise<SocialUser>;
}
