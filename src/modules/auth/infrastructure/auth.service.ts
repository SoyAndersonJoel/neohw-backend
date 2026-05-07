import { Inject, Injectable } from '@nestjs/common';
import { AuthResult } from '../application/auth-result';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import {
  LOGIN_USE_CASE,
  LOGOUT_USE_CASE,
  REFRESH_TOKEN_USE_CASE,
  REGISTER_USE_CASE,
} from '../auth.tokens';
import { handleAuthError } from './auth-error-mapper';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshRequestUser } from './types/auth-request-user';

@Injectable()
export class AuthService {
  constructor(
    @Inject(REGISTER_USE_CASE)
    private readonly registerUseCase: RegisterUseCase,
    @Inject(LOGIN_USE_CASE)
    private readonly loginUseCase: LoginUseCase,
    @Inject(REFRESH_TOKEN_USE_CASE)
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @Inject(LOGOUT_USE_CASE)
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    return this.wrap(() => this.registerUseCase.execute(dto));
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    return this.wrap(() => this.loginUseCase.execute(dto));
  }

  async refresh(user: RefreshRequestUser): Promise<AuthResult> {
    return this.wrap(() =>
      this.refreshTokenUseCase.execute({
        userId: user.userId,
        tokenId: user.tokenId,
        refreshToken: user.refreshToken,
      }),
    );
  }

  async logout(user: RefreshRequestUser): Promise<void> {
    return this.wrap(() =>
      this.logoutUseCase.execute({
        tokenId: user.tokenId,
      }),
    );
  }

  private async wrap<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }
}
