import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuthTokenService } from './application/auth-token.service';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { SocialLoginUseCase } from './application/use-cases/social-login.use-case';
import { RequestOtpUseCase } from './application/use-cases/request-otp.use-case';
import { ResetPasswordOtpUseCase } from './application/use-cases/reset-password-otp.use-case';
import { VerifyAccountOtpUseCase } from './application/use-cases/verify-account-otp.use-case';
import { CreateUserUseCase } from '../users/application/use-cases/create-user.use-case';
import { FindUserByEmailUseCase } from '../users/application/use-cases/find-user-by-email.use-case';
import { FindUserByIdUseCase } from '../users/application/use-cases/find-user-by-id.use-case';
import {
  AUTH_TOKEN_SERVICE,
  HASH_SERVICE,
  ID_GENERATOR,
  LOGIN_USE_CASE,
  LOGOUT_USE_CASE,
  REFRESH_TOKEN_REPOSITORY,
  REFRESH_TOKEN_USE_CASE,
  REGISTER_USE_CASE,
  TOKEN_SERVICE,
  SOCIAL_LOGIN_USE_CASE,
  GOOGLE_AUTH_SERVICE,
  FACEBOOK_AUTH_SERVICE,
  REQUEST_OTP_USE_CASE,
  RESET_PASSWORD_OTP_USE_CASE,
  VERIFY_ACCOUNT_OTP_USE_CASE,
} from './auth.tokens';
import { AuthController } from './infrastructure/auth.controller';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { PrismaRefreshTokenRepository } from './infrastructure/repositories/prisma-refresh-token.repository';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { Argon2HashService } from './infrastructure/services/argon2-hash.service';
import { CryptoIdGenerator } from './infrastructure/services/crypto-id-generator.service';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import type { HashService } from './domain/interfaces/hash.service';
import type { IdGenerator } from './domain/interfaces/id-generator';
import type { RefreshTokenRepository } from './domain/interfaces/refresh-token.repository';
import type { TokenService } from './domain/interfaces/token.service';
import { GoogleAuthService } from './infrastructure/services/google-auth.service';
import { FacebookAuthService } from './infrastructure/services/facebook-auth.service';
import type { ISocialAuthService } from './domain/interfaces/social-auth.service.interface';

const authTokenServiceProvider = {
  provide: AUTH_TOKEN_SERVICE,
  useFactory: (
    tokenService: TokenService,
    refreshTokenRepository: RefreshTokenRepository,
    hashService: HashService,
    idGenerator: IdGenerator,
    configService: ConfigService,
  ): AuthTokenService => {
    const refreshTtlSeconds =
      configService.get<number>('auth.jwt.refreshTtlSeconds') ?? 1209600;
    return new AuthTokenService(
      tokenService,
      refreshTokenRepository,
      hashService,
      idGenerator,
      refreshTtlSeconds,
    );
  },
  inject: [
    TOKEN_SERVICE,
    REFRESH_TOKEN_REPOSITORY,
    HASH_SERVICE,
    ID_GENERATOR,
    ConfigService,
  ],
};

const registerUseCaseProvider = {
  provide: REGISTER_USE_CASE,
  useFactory: (
    createUserUseCase: CreateUserUseCase,
    hashService: HashService,
    authTokenService: AuthTokenService,
    requestOtpUseCase: RequestOtpUseCase,
  ): RegisterUseCase =>
    new RegisterUseCase(createUserUseCase, hashService, authTokenService, requestOtpUseCase),
  inject: [CreateUserUseCase, HASH_SERVICE, AUTH_TOKEN_SERVICE, REQUEST_OTP_USE_CASE],
};

const loginUseCaseProvider = {
  provide: LOGIN_USE_CASE,
  useFactory: (
    findUserByEmailUseCase: FindUserByEmailUseCase,
    hashService: HashService,
    authTokenService: AuthTokenService,
  ): LoginUseCase =>
    new LoginUseCase(findUserByEmailUseCase, hashService, authTokenService),
  inject: [FindUserByEmailUseCase, HASH_SERVICE, AUTH_TOKEN_SERVICE],
};

const refreshTokenUseCaseProvider = {
  provide: REFRESH_TOKEN_USE_CASE,
  useFactory: (
    findUserByIdUseCase: FindUserByIdUseCase,
    authTokenService: AuthTokenService,
  ): RefreshTokenUseCase =>
    new RefreshTokenUseCase(findUserByIdUseCase, authTokenService),
  inject: [FindUserByIdUseCase, AUTH_TOKEN_SERVICE],
};

const logoutUseCaseProvider = {
  provide: LOGOUT_USE_CASE,
  useFactory: (authTokenService: AuthTokenService): LogoutUseCase =>
    new LogoutUseCase(authTokenService),
  inject: [AUTH_TOKEN_SERVICE],
};

const socialLoginUseCaseProvider = {
  provide: SOCIAL_LOGIN_USE_CASE,
  useFactory: (
    findUserByEmailUseCase: FindUserByEmailUseCase,
    createUserUseCase: CreateUserUseCase,
    authTokenService: AuthTokenService,
    googleAuthService: ISocialAuthService,
    facebookAuthService: ISocialAuthService,
  ): SocialLoginUseCase =>
    new SocialLoginUseCase(
      findUserByEmailUseCase,
      createUserUseCase,
      authTokenService,
      googleAuthService,
      facebookAuthService,
    ),
  inject: [
    FindUserByEmailUseCase,
    CreateUserUseCase,
    AUTH_TOKEN_SERVICE,
    GOOGLE_AUTH_SERVICE,
    FACEBOOK_AUTH_SERVICE,
  ],
};

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
    PrismaModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    JwtRefreshStrategy,
    RolesGuard,
    authTokenServiceProvider,
    registerUseCaseProvider,
    loginUseCaseProvider,
    refreshTokenUseCaseProvider,
    logoutUseCaseProvider,
    socialLoginUseCaseProvider,
    { provide: HASH_SERVICE, useClass: Argon2HashService },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: PrismaRefreshTokenRepository,
    },
    { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
    { provide: GOOGLE_AUTH_SERVICE, useClass: GoogleAuthService },
    { provide: FACEBOOK_AUTH_SERVICE, useClass: FacebookAuthService },
    { provide: REQUEST_OTP_USE_CASE, useClass: RequestOtpUseCase },
    { provide: RESET_PASSWORD_OTP_USE_CASE, useClass: ResetPasswordOtpUseCase },
    { provide: VERIFY_ACCOUNT_OTP_USE_CASE, useClass: VerifyAccountOtpUseCase },
  ],
  exports: [RolesGuard],
})
export class AuthModule {}
