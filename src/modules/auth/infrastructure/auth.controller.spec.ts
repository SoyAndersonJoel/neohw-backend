import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { SocialLoginUseCase } from '../application/use-cases/social-login.use-case';
import { RequestOtpUseCase } from '../application/use-cases/request-otp.use-case';
import { ResetPasswordOtpUseCase } from '../application/use-cases/reset-password-otp.use-case';
import { VerifyAccountOtpUseCase } from '../application/use-cases/verify-account-otp.use-case';
import { ConfigService } from '@nestjs/config';
import { mock, mockClear } from 'jest-mock-extended';
import { Response } from 'express';
import {
  LOGIN_USE_CASE,
  REGISTER_USE_CASE,
  REFRESH_TOKEN_USE_CASE,
  LOGOUT_USE_CASE,
  SOCIAL_LOGIN_USE_CASE,
  REQUEST_OTP_USE_CASE,
  RESET_PASSWORD_OTP_USE_CASE,
  VERIFY_ACCOUNT_OTP_USE_CASE,
} from '../auth.tokens';

describe('AuthController', () => {
  let controller: AuthController;

  const registerUseCase = mock<RegisterUseCase>();
  const loginUseCase = mock<LoginUseCase>();
  const configService = mock<ConfigService>();
  
  // Mocks for other dependencies required by the controller constructor
  const refreshTokenUseCase = mock<RefreshTokenUseCase>();
  const logoutUseCase = mock<LogoutUseCase>();
  const socialLoginUseCase = mock<SocialLoginUseCase>();
  const requestOtpUseCase = mock<RequestOtpUseCase>();
  const resetPasswordOtpUseCase = mock<ResetPasswordOtpUseCase>();
  const verifyAccountOtpUseCase = mock<VerifyAccountOtpUseCase>();

  beforeEach(async () => {
    mockClear(registerUseCase);
    mockClear(loginUseCase);
    mockClear(configService);

    configService.get.mockImplementation((key: string) => {
      if (key === 'auth.jwt.refreshTtlSeconds') return 3600;
      return null;
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: REGISTER_USE_CASE, useValue: registerUseCase },
        { provide: LOGIN_USE_CASE, useValue: loginUseCase },
        { provide: REFRESH_TOKEN_USE_CASE, useValue: refreshTokenUseCase },
        { provide: LOGOUT_USE_CASE, useValue: logoutUseCase },
        { provide: SOCIAL_LOGIN_USE_CASE, useValue: socialLoginUseCase },
        { provide: REQUEST_OTP_USE_CASE, useValue: requestOtpUseCase },
        { provide: RESET_PASSWORD_OTP_USE_CASE, useValue: resetPasswordOtpUseCase },
        { provide: VERIFY_ACCOUNT_OTP_USE_CASE, useValue: verifyAccountOtpUseCase },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should call registerUseCase and return its result', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      const expectedResult = { message: 'Registro exitoso' };
      
      registerUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.register(dto);

      expect(registerUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call loginUseCase, set refresh cookie and return access token', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      const mockUser = { id: '123', email: 'test@example.com', roles: ['USER'] };
      const useCaseResult = {
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      loginUseCase.execute.mockResolvedValue(useCaseResult);

      const mockResponse = mock<Response>();
      
      const result = await controller.login(dto, mockResponse);

      expect(loginUseCase.execute).toHaveBeenCalledWith(dto);
      
      // Verifica que la cookie HTTP-only fue configurada
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          path: '/auth',
          maxAge: 3600000, // 3600 * 1000
        })
      );

      // Verifica que no se filtra el refresh token al JSON público
      expect(result).toEqual({
        accessToken: 'access-token',
        user: mockUser,
      });
    });
  });
});
