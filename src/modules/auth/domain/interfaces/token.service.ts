import { RefreshTokenPayload, TokenPayload } from '../types/token-payload';

export interface TokenService {
  signAccessToken(payload: TokenPayload): Promise<string>;
  signRefreshToken(payload: RefreshTokenPayload): Promise<string>;
}
