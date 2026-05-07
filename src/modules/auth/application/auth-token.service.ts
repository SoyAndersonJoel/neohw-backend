import { User } from '../../users/domain/entities/user.entity';
import { HashService } from '../domain/interfaces/hash.service';
import { IdGenerator } from '../domain/interfaces/id-generator';
import { RefreshTokenRepository } from '../domain/interfaces/refresh-token.repository';
import { TokenService } from '../domain/interfaces/token.service';
import { TokenPayload } from '../domain/types/token-payload';
import { AuthError } from './errors/auth.error';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export class AuthTokenService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly hashService: HashService,
    private readonly idGenerator: IdGenerator,
    private readonly refreshTokenTtlSeconds: number,
  ) {}

  async issueTokens(user: User): Promise<AuthTokens> {
    const payload = this.buildPayload(user);
    const accessToken = await this.tokenService.signAccessToken(payload);

    const refreshTokenId = this.idGenerator.generate();
    const refreshToken = await this.tokenService.signRefreshToken({
      ...payload,
      tokenId: refreshTokenId,
    });

    const tokenHash = await this.hashService.hash(refreshToken);
    const expiresAt = new Date(Date.now() + this.refreshTokenTtlSeconds * 1000);

    await this.refreshTokenRepository.create({
      id: refreshTokenId,
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  async rotateRefreshToken(
    user: User,
    tokenId: string,
    refreshToken: string,
  ): Promise<AuthTokens> {
    const stored = await this.refreshTokenRepository.findById(tokenId);
    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt.getTime() <= Date.now()
    ) {
      throw new AuthError('INVALID_REFRESH_TOKEN');
    }
    if (stored.userId !== user.id) {
      throw new AuthError('INVALID_REFRESH_TOKEN');
    }

    const matches = await this.hashService.verify(
      stored.tokenHash,
      refreshToken,
    );
    if (!matches) {
      throw new AuthError('INVALID_REFRESH_TOKEN');
    }

    const payload = this.buildPayload(user);
    const newTokenId = this.idGenerator.generate();
    const newRefreshToken = await this.tokenService.signRefreshToken({
      ...payload,
      tokenId: newTokenId,
    });

    const newTokenHash = await this.hashService.hash(newRefreshToken);
    const newExpiresAt = new Date(
      Date.now() + this.refreshTokenTtlSeconds * 1000,
    );

    await this.refreshTokenRepository.create({
      id: newTokenId,
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt: newExpiresAt,
    });

    await this.refreshTokenRepository.revoke(tokenId, newTokenId);

    const accessToken = await this.tokenService.signAccessToken(payload);
    return { accessToken, refreshToken: newRefreshToken };
  }

  async revokeToken(tokenId: string): Promise<void> {
    await this.refreshTokenRepository.revoke(tokenId, null);
  }

  private buildPayload(user: User): TokenPayload {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
