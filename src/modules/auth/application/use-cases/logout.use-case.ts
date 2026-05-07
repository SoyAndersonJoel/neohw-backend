import { AuthTokenService } from '../auth-token.service';

export type LogoutInput = {
  tokenId: string;
};

export class LogoutUseCase {
  constructor(private readonly authTokenService: AuthTokenService) {}

  async execute(input: LogoutInput): Promise<void> {
    await this.authTokenService.revokeToken(input.tokenId);
  }
}
