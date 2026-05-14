import { AuthResult, toPublicUser } from '../auth-result';
import { AuthTokenService } from '../auth-token.service';
import { AuthError } from '../errors/auth.error';
import { HashService } from '../../domain/interfaces/hash.service';
import { FindUserByEmailUseCase } from '../../../users/application/use-cases/find-user-by-email.use-case';

export type LoginInput = {
  email: string;
  password: string;
};

export class LoginUseCase {
  constructor(
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
    private readonly hashService: HashService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(input: LoginInput): Promise<AuthResult> {
    const user = await this.findUserByEmailUseCase.execute(input.email);
    if (!user) {
      throw new AuthError('INVALID_CREDENTIALS');
    }
    if (!user.isActive) {
      throw new AuthError('USER_DISABLED');
    }

    if (!user.passwordHash) {
      // El usuario se registró con Google/Facebook y no tiene contraseña local
      throw new AuthError('INVALID_CREDENTIALS');
    }

    const valid = await this.hashService.verify(
      user.passwordHash,
      input.password,
    );
    if (!valid) {
      throw new AuthError('INVALID_CREDENTIALS');
    }

    const tokens = await this.authTokenService.issueTokens(user);
    return {
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
