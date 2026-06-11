import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { VerifyAccountOtpDto } from '../dtos/verify-account-otp.dto';
import { OtpPurpose } from '../../../../generated/prisma/enums';
import { AuthTokenService } from '../auth-token.service';
import { AuthResult, toPublicUser } from '../auth-result';
import { User } from '../../../users/domain/entities/user.entity';
import { Role } from '../../../users/domain/enums/role.enum';
import { AuthProvider } from '../../../users/domain/enums/auth-provider.enum';
import { AUTH_TOKEN_SERVICE } from '../../auth.tokens';

@Injectable()
export class VerifyAccountOtpUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(AUTH_TOKEN_SERVICE) private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(dto: VerifyAccountOtpDto): Promise<AuthResult> {
    const { email, code } = dto;

    // Buscar código OTP válido
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        email,
        code,
        purpose: OtpPurpose.ACCOUNT_VERIFICATION,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      throw new BadRequestException('El código de verificación es inválido o ha expirado.');
    }

    // Actualizar estado de verificación y marcar OTP como usado en una transacción
    const [updatedUser] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { email },
        data: { isVerified: true },
      }),
      this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { isUsed: true },
      }),
    ]);

    // Emitir tokens al usuario verificado
    const user: User = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      passwordHash: updatedUser.passwordHash,
      provider: updatedUser.provider as AuthProvider,
      providerId: updatedUser.providerId,
      role: updatedUser.role as Role,
      isActive: updatedUser.isActive,
      isVerified: true,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    const tokens = await this.authTokenService.issueTokens(user);

    return {
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
