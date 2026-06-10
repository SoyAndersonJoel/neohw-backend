import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { ResetPasswordOtpDto } from '../dtos/reset-password-otp.dto';
import { OtpPurpose } from '../../../../generated/prisma/enums';
import { Inject } from '@nestjs/common';
import { HASH_SERVICE } from '../../auth.tokens';
import type { HashService } from '../../domain/interfaces/hash.service';

@Injectable()
export class ResetPasswordOtpUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(HASH_SERVICE) private readonly hashService: HashService,
  ) {}

  async execute(dto: ResetPasswordOtpDto) {
    const { email, code, newPassword } = dto;

    // Buscar código OTP válido
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        email,
        code,
        purpose: OtpPurpose.PASSWORD_RESET,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      throw new BadRequestException('El código de verificación es inválido o ha expirado.');
    }

    // Hashear la nueva contraseña
    const hashedPassword = await this.hashService.hash(newPassword);

    // Actualizar contraseña y marcar OTP como usado en una transacción
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { email },
        data: { passwordHash: hashedPassword },
      }),
      this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { isUsed: true },
      }),
    ]);

    return { message: 'Tu contraseña ha sido actualizada exitosamente.' };
  }
}
