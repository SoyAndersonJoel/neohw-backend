import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  RefreshTokenPayload,
  TokenPayload,
} from '../../domain/types/token-payload';
import { TokenService } from '../../domain/interfaces/token.service';

@Injectable()
export class JwtTokenService implements TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessTtlSeconds: number;
  private readonly refreshTtlSeconds: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const accessSecret = this.configService.get<string>(
      'auth.jwt.accessSecret',
    );
    const refreshSecret = this.configService.get<string>(
      'auth.jwt.refreshSecret',
    );

    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets are not configured');
    }

    this.accessSecret = accessSecret;
    this.refreshSecret = refreshSecret;
    this.accessTtlSeconds =
      this.configService.get<number>('auth.jwt.accessTtlSeconds') ?? 900;
    this.refreshTtlSeconds =
      this.configService.get<number>('auth.jwt.refreshTtlSeconds') ?? 1209600;
  }

  async signAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessTtlSeconds,
    });
  }

  async signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshTtlSeconds,
    });
  }
}
