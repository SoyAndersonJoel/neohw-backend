import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ISocialAuthService } from '../../domain/interfaces/social-auth.service.interface';
import { SocialUser } from '../../domain/types/social-user';

@Injectable()
export class FacebookAuthService implements ISocialAuthService {
  private appId: string;
  private appSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get<string>('FACEBOOK_APP_ID') || '';
    this.appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET') || '';
  }

  async verifyToken(token: string): Promise<SocialUser> {
    try {
      // Endpoint to verify the token validity
      const debugTokenUrl = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${this.appId}|${this.appSecret}`;
      const debugResponse = await axios.get(debugTokenUrl);
      
      if (!debugResponse.data.data.is_valid) {
        throw new UnauthorizedException('Invalid Facebook token');
      }

      const providerId = debugResponse.data.data.user_id;

      // Endpoint to get the user email
      const meUrl = `https://graph.facebook.com/me?fields=email&access_token=${token}`;
      const meResponse = await axios.get(meUrl);

      const email = meResponse.data.email;

      if (!email) {
        throw new UnauthorizedException('Facebook account must have an email associated');
      }

      return {
        email,
        providerId,
      };
    } catch (error) {
      throw new UnauthorizedException('Facebook authentication failed: ' + (error.response?.data?.error?.message || error.message));
    }
  }
}
