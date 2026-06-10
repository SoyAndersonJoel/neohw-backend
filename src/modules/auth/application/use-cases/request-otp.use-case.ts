import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { NotificationsService } from '../../../notifications/application/services/notifications.service';
import { RequestOtpDto } from '../dtos/request-otp.dto';
import { OtpPurpose } from '../../../../generated/prisma/enums';

@Injectable()
export class RequestOtpUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async execute(dto: RequestOtpDto) {
    const { email, purpose } = dto;

    // Verificar si el usuario existe para reset de password
    if (purpose === OtpPurpose.PASSWORD_RESET) {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Por seguridad, no decimos si el email existe o no, pero cortamos la ejecución en silencio
        return { message: 'Si el correo existe, se ha enviado un código de verificación.' };
      }
    }

    // Inactivar OTPs previos del mismo propósito
    await this.prisma.otpCode.updateMany({
      where: { email, purpose, isUsed: false },
      data: { isUsed: true },
    });

    // Generar código numérico de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos de validez

    await this.prisma.otpCode.create({
      data: {
        email,
        code,
        purpose,
        expiresAt,
      },
    });

    // Enviar el correo
    const emailPurpose = purpose === OtpPurpose.PASSWORD_RESET 
      ? 'Recuperación de Contraseña' 
      : 'Verificación de Cuenta';

    await this.notifications.sendOtpEmail(email, code, emailPurpose);

    return { message: 'Si el correo existe, se ha enviado un código de verificación.' };
  }
}
