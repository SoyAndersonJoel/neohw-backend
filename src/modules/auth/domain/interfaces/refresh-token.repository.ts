import { RefreshToken } from '../entities/refresh-token.entity';

export type CreateRefreshTokenParams = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export interface RefreshTokenRepository {
  create(data: CreateRefreshTokenParams): Promise<void>;
  findById(id: string): Promise<RefreshToken | null>;
  revoke(id: string, replacedByTokenId: string | null): Promise<void>;
}
