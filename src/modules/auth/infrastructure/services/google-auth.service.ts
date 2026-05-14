import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { ISocialAuthService } from '../../domain/interfaces/social-auth.service.interface';
import { SocialUser } from '../../domain/types/social-user';

@Injectable()
export class GoogleAuthService implements ISocialAuthService {
  private client: OAuth2Client;
  private clientId: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID') || '';
    this.client = new OAuth2Client(this.clientId);
  }

  async verifyToken(token: string): Promise<SocialUser> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.clientId,
      });
      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      return {
        email: payload.email,
        providerId: payload.sub,
      };
    } catch (error) {
      throw new UnauthorizedException('Google authentication failed: ' + error.message);
    }
  }
}
