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
import {
  AccessRequestUser,
  RefreshRequestUser,
} from './types/auth-request-user';
import { AuthErrorInterceptor } from './auth-error.interceptor';
import { 
  LOGIN_USE_CASE, 
  REGISTER_USE_CASE, 
  REFRESH_TOKEN_USE_CASE, 
  LOGOUT_USE_CASE 
} from '../auth.tokens';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';

@Controller('auth')
@UseInterceptors(AuthErrorInterceptor)
export class AuthController {
  constructor(
    @Inject(REGISTER_USE_CASE) private readonly registerUseCase: RegisterUseCase,
    @Inject(LOGIN_USE_CASE) private readonly loginUseCase: LoginUseCase,
    @Inject(REFRESH_TOKEN_USE_CASE) private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @Inject(LOGOUT_USE_CASE) private readonly logoutUseCase: LogoutUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.registerUseCase.execute(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.loginUseCase.execute(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
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
  async me(
    @Req() req: Request & { user: AccessRequestUser },
  ): Promise<{ user: AccessRequestUser }> {
    return { user: req.user };
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
