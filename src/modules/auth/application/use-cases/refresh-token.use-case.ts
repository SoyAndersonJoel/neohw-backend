import { AuthResult, toPublicUser } from '../auth-result';
import { AuthTokenService } from '../auth-token.service';
import { AuthError } from '../errors/auth.error';
import { FindUserByIdUseCase } from '../../../users/application/use-cases/find-user-by-id.use-case';

export type RefreshTokenInput = {
  userId: string;
  tokenId: string;
  refreshToken: string;
};

export class RefreshTokenUseCase {
  constructor(
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(input: RefreshTokenInput): Promise<AuthResult> {
    const user = await this.findUserByIdUseCase.execute(input.userId);
    if (!user || !user.isActive) {
      throw new AuthError('INVALID_REFRESH_TOKEN');
    }

    const tokens = await this.authTokenService.rotateRefreshToken(
      user,
      input.tokenId,
      input.refreshToken,
    );

    return {
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
