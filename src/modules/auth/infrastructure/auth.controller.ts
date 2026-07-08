import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { CookieOptions, Request, Response } from 'express';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { RequestOtpDto } from '../application/dtos/request-otp.dto';
import { ResetPasswordOtpDto } from '../application/dtos/reset-password-otp.dto';
import { VerifyAccountOtpDto } from '../application/dtos/verify-account-otp.dto';
import { AuthProvider } from '../../users/domain/enums/auth-provider.enum';
import {
  AccessRequestUser,
  RefreshRequestUser,
} from './types/auth-request-user';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { AuthErrorInterceptor } from './auth-error.interceptor';
import { 
  LOGIN_USE_CASE, 
  REGISTER_USE_CASE, 
  REFRESH_TOKEN_USE_CASE, 
  LOGOUT_USE_CASE,
  SOCIAL_LOGIN_USE_CASE,
  REQUEST_OTP_USE_CASE,
  RESET_PASSWORD_OTP_USE_CASE,
  VERIFY_ACCOUNT_OTP_USE_CASE
} from '../auth.tokens';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { SocialLoginUseCase } from '../application/use-cases/social-login.use-case';
import type { RequestOtpUseCase } from '../application/use-cases/request-otp.use-case';
import type { ResetPasswordOtpUseCase } from '../application/use-cases/reset-password-otp.use-case';
import type { VerifyAccountOtpUseCase } from '../application/use-cases/verify-account-otp.use-case';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(AuthErrorInterceptor)
export class AuthController {
  constructor(
    @Inject(REGISTER_USE_CASE) private readonly registerUseCase: RegisterUseCase,
    @Inject(LOGIN_USE_CASE) private readonly loginUseCase: LoginUseCase,
    @Inject(REFRESH_TOKEN_USE_CASE) private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @Inject(LOGOUT_USE_CASE) private readonly logoutUseCase: LogoutUseCase,
    @Inject(SOCIAL_LOGIN_USE_CASE) private readonly socialLoginUseCase: SocialLoginUseCase,
    @Inject(REQUEST_OTP_USE_CASE) private readonly requestOtpUseCase: RequestOtpUseCase,
    @Inject(RESET_PASSWORD_OTP_USE_CASE) private readonly resetPasswordOtpUseCase: ResetPasswordOtpUseCase,
    @Inject(VERIFY_ACCOUNT_OTP_USE_CASE) private readonly verifyAccountOtpUseCase: VerifyAccountOtpUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente. Requiere verificación OTP.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o el correo ya existe.' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.registerUseCase.execute(registerDto);
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.loginUseCase.execute(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @ApiExcludeEndpoint()
  @Post('social/google')
  async loginWithGoogle(
    @Body() dto: SocialLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.socialLoginUseCase.execute({
      token: dto.token,
      provider: AuthProvider.GOOGLE,
    });
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @ApiExcludeEndpoint()
  @Post('social/facebook')
  async loginWithFacebook(
    @Body() dto: SocialLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.socialLoginUseCase.execute({
      token: dto.token,
      provider: AuthProvider.FACEBOOK,
    });
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Refrescar token de acceso', description: 'Requiere la cookie refresh_token' })
  @ApiResponse({ status: 200, description: 'Token refrescado exitosamente', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado' })
  async refresh(
    @Req() req: Request & { user: RefreshRequestUser },
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.refreshTokenUseCase.execute({
      userId: req.user.userId,
      tokenId: req.user.tokenId,
      refreshToken: req.user.refreshToken,
    });
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Cerrar sesión', description: 'Revoca el token actual y limpia la cookie' })
  @ApiResponse({ status: 200, description: 'Cierre de sesión exitoso' })
  async logout(
    @Req() req: Request & { user: RefreshRequestUser },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean }> {
    await this.logoutUseCase.execute({
      tokenId: req.user.tokenId,
    });
    this.clearRefreshCookie(res);
    return { success: true };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async me(
    @Req() req: Request & { user: AccessRequestUser },
  ): Promise<{ user: AccessRequestUser }> {
    return { user: req.user };
  }

  @Post('request-otp')
  @ApiOperation({ summary: 'Solicitar código OTP para recuperación de contraseña' })
  @ApiResponse({ status: 200, description: 'Correo con OTP enviado' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.requestOtpUseCase.execute(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña usando código OTP' })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida exitosamente' })
  @ApiResponse({ status: 400, description: 'OTP inválido o expirado' })
  async resetPassword(@Body() dto: ResetPasswordOtpDto) {
    return this.resetPasswordOtpUseCase.execute(dto);
  }

  @Post('verify-account')
  @ApiOperation({ summary: 'Verificar cuenta de usuario recién registrado usando OTP' })
  @ApiResponse({ status: 200, description: 'Cuenta verificada exitosamente', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'OTP inválido o expirado' })
  async verifyAccount(
    @Body() dto: VerifyAccountOtpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.verifyAccountOtpUseCase.execute(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie('refresh_token', refreshToken, this.getRefreshCookieOptions());
  }

  private clearRefreshCookie(res: Response): void {
    const options = this.getRefreshCookieOptions();
    res.clearCookie('refresh_token', { ...options, maxAge: 0 });
  }

  private getRefreshCookieOptions(): CookieOptions {
    const refreshTtlSeconds =
      this.configService.get<number>('auth.jwt.refreshTtlSeconds') ?? 1209600;
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/auth',
      maxAge: refreshTtlSeconds * 1000,
    };
  }
}
