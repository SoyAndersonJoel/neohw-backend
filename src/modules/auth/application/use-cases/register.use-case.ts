import { Role } from '../../../users/domain/enums/role.enum';
import { AuthResult, toPublicUser } from '../auth-result';
import { AuthTokenService } from '../auth-token.service';
import { HashService } from '../../domain/interfaces/hash.service';
import { CreateUserUseCase } from '../../../users/application/use-cases/create-user.use-case';
import { RequestOtpUseCase } from './request-otp.use-case';
import { OtpPurpose } from '../../../../generated/prisma/enums';

export type RegisterInput = {
  email: string;
  password: string;
};

export class RegisterUseCase {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly hashService: HashService,
    private readonly requestOtpUseCase: RequestOtpUseCase,
  ) {}

  async execute(input: RegisterInput): Promise<{ message: string }> {
    const passwordHash = await this.hashService.hash(input.password);
    const user = await this.createUserUseCase.execute({
      email: input.email,
      passwordHash,
      role: Role.USER,
    });

    // Enviar código de verificación de forma asíncrona
    this.requestOtpUseCase.execute({
      email: input.email,
      purpose: OtpPurpose.ACCOUNT_VERIFICATION,
    }).catch(err => {
      console.error('Error enviando correo de verificación inicial:', err);
    });

    return { message: 'Registro exitoso. Por favor, revisa tu correo electrónico para verificar tu cuenta.' };
  }
}
