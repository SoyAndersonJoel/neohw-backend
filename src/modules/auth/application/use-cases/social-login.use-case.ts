import { AuthProvider } from '../../../users/domain/enums/auth-provider.enum';
import { Role } from '../../../users/domain/enums/role.enum';
import { AuthResult, toPublicUser } from '../auth-result';
import { AuthTokenService } from '../auth-token.service';
import { ISocialAuthService } from '../../domain/interfaces/social-auth.service.interface';
import { CreateUserUseCase } from '../../../users/application/use-cases/create-user.use-case';
import { FindUserByEmailUseCase } from '../../../users/application/use-cases/find-user-by-email.use-case';
import { AuthError } from '../errors/auth.error';

export type SocialLoginInput = {
  token: string;
  provider: AuthProvider;
};

export class SocialLoginUseCase {
  constructor(
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly authTokenService: AuthTokenService,
    private readonly googleAuthService: ISocialAuthService,
    private readonly facebookAuthService: ISocialAuthService,
  ) {}

  async execute(input: SocialLoginInput): Promise<AuthResult> {
    const socialService = this.getSocialService(input.provider);
    const socialUser = await socialService.verifyToken(input.token);

    let user = await this.findUserByEmailUseCase.execute(socialUser.email);

    if (user) {
      if (!user.isActive) {
        throw new AuthError('USER_DISABLED');
      }
      // Consider updating the provider/providerId here if they were previously LOCAL
    } else {
      user = await this.createUserUseCase.execute({
        email: socialUser.email,
        passwordHash: null,
        provider: input.provider,
        providerId: socialUser.providerId,
        role: Role.USER,
      });
    }

    const tokens = await this.authTokenService.issueTokens(user);
    return {
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private getSocialService(provider: AuthProvider): ISocialAuthService {
    if (provider === AuthProvider.GOOGLE) {
      return this.googleAuthService;
    }
    if (provider === AuthProvider.FACEBOOK) {
      return this.facebookAuthService;
    }
    throw new AuthError('INVALID_CREDENTIALS');
  }
}
