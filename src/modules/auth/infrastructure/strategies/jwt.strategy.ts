import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../../domain/types/token-payload';
import { FindUserByIdUseCase } from '../../../users/application/use-cases/find-user-by-id.use-case';
import { AccessRequestUser } from '../types/auth-request-user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {
    const secret = configService.get<string>('auth.jwt.accessSecret');
    if (!secret) {
      throw new Error('JWT access secret is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(payload: TokenPayload): Promise<AccessRequestUser> {
    const user = await this.findUserByIdUseCase.execute(payload.sub);
    if (!user || !user.isActive || !user.isVerified) {
      throw new UnauthorizedException('User account is not active or not verified');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
