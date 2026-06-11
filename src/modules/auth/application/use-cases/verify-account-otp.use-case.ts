import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { VerifyAccountOtpDto } from '../dtos/verify-account-otp.dto';
import { OtpPurpose } from '../../../../generated/prisma/enums';

@Injectable()
export class VerifyAccountOtpUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: VerifyAccountOtpDto) {
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

    // Actualizar estado de verificación y marcar OTP como usado
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { email },
        data: { isVerified: true },
      }),
      this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { isUsed: true },
      }),
    ]);

    return { message: 'Tu cuenta ha sido verificada exitosamente.' };
  }
}
