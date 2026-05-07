import { Role } from '../../../users/domain/enums/role.enum';
import { AuthResult, toPublicUser } from '../auth-result';
import { AuthTokenService } from '../auth-token.service';
import { HashService } from '../../domain/interfaces/hash.service';
import { CreateUserUseCase } from '../../../users/application/use-cases/create-user.use-case';

export type RegisterInput = {
  email: string;
  password: string;
};

export class RegisterUseCase {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly hashService: HashService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(input: RegisterInput): Promise<AuthResult> {
    const passwordHash = await this.hashService.hash(input.password);
    const user = await this.createUserUseCase.execute({
      email: input.email,
      passwordHash,
      role: Role.USER,
    });

    const tokens = await this.authTokenService.issueTokens(user);
    return {
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
