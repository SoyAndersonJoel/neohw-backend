import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import * as React from 'react';
import { OtpEmail } from '../../templates/otp.template';
import { RoleChangeEmail } from '../../templates/role-change.template';
import { OrderInvoiceEmail } from '../../templates/order-invoice.template';
import { OrderShippedEmail } from '../../templates/order-shipped.template';
import { OrderDeliveredEmail } from '../../templates/order-delivered.template';

@Injectable()
export class NotificationsService {
  private resend: Resend;
  private readonly logger = new Logger(NotificationsService.name);
  private defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY') || 're_dummy';
    this.resend = new Resend(apiKey);
    // Para pruebas, Resend permite enviar desde 'onboarding@resend.dev' si no tienes dominio verificado
    this.defaultFrom = this.configService.get<string>('EMAIL_FROM') || 'NeoHW <onboarding@resend.dev>';
  }

  async sendOtpEmail(to: string, code: string, purpose: 'Verificación de Cuenta' | 'Recuperación de Contraseña') {
    try {
      const html = await render(
        React.createElement(OtpEmail, { validationCode: code, purpose })
      );

      const response = await this.resend.emails.send({
        from: this.defaultFrom,
        to,
        subject: `NeoHW - Código para ${purpose}`,
        html,
      });

      this.logger.log(`OTP Email sent to ${to}, ID: ${response.data?.id}`);
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to send OTP email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendRoleChangeEmail(to: string, firstName: string, newRole: string) {
    try {
      const html = await render(
        React.createElement(RoleChangeEmail, { firstName, newRole })
      );

      const response = await this.resend.emails.send({
        from: this.defaultFrom,
        to,
        subject: 'NeoHW - Tu rol ha sido actualizado',
        html,
      });

      this.logger.log(`Role change email sent to ${to}, ID: ${response.data?.id}`);
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to send role change email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendOrderInvoiceEmail(to: string, orderData: any) {
    try {
      const html = await render(React.createElement(OrderInvoiceEmail, orderData));

      const response = await this.resend.emails.send({
        from: this.defaultFrom,
        to,
        subject: `NeoHW - Factura de tu pedido ${orderData.trackingCode}`,
        html,
      });

      this.logger.log(`Order invoice email sent to ${to}, ID: ${response.data?.id}`);
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to send order invoice email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendOrderShippedEmail(to: string, orderData: any) {
    try {
      const html = await render(React.createElement(OrderShippedEmail, orderData));

      const response = await this.resend.emails.send({
        from: this.defaultFrom,
        to,
        subject: `NeoHW - Tu pedido ${orderData.trackingCode} está en camino`,
        html,
      });

      this.logger.log(`Order shipped email sent to ${to}, ID: ${response.data?.id}`);
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to send order shipped email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendOrderDeliveredEmail(to: string, orderData: any) {
    try {
      const html = await render(React.createElement(OrderDeliveredEmail, orderData));

      const response = await this.resend.emails.send({
        from: this.defaultFrom,
        to,
        subject: `NeoHW - Pedido ${orderData.trackingCode} Entregado`,
        html,
      });

      this.logger.log(`Order delivered email sent to ${to}, ID: ${response.data?.id}`);
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to send order delivered email to ${to}: ${error.message}`);
      throw error;
    }
  }
}
