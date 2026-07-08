import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface OtpEmailProps {
  validationCode: string;
  purpose: 'Verificación de Cuenta' | 'Recuperación de Contraseña';
}

export const OtpEmail = ({ validationCode = '123456', purpose = 'Verificación de Cuenta' }: OtpEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Tu código de seguridad de NeoHW</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* ── Header ── */}
          <Section style={headerSection}>
            <Img
              src="https://res.cloudinary.com/dkmqkhlhf/image/upload/v1781135156/logoHW-removebg-preview_bt0mwm.png"
              width="140"
              alt="NeoHW Logo"
              style={logo}
            />
          </Section>

          {/* ── Body ── */}
          <Section style={bodySection}>
            <Text style={emoji}>🔐</Text>
            <Heading style={h1}>Código de Seguridad</Heading>
            
            <Text style={text}>
              Has solicitado un código para: <strong>{purpose}</strong>.
            </Text>

            <Section style={codeContainer}>
              <Text style={code}>{validationCode}</Text>
            </Section>

            <Text style={text}>
              Ingresa este código en la aplicación para continuar. Este código expirará en 15 minutos.
            </Text>

            <Section style={warningBox}>
              <Text style={warningText}>
                ⚠️ Si no solicitaste este código, puedes ignorar este correo de forma segura.
              </Text>
            </Section>
          </Section>

          {/* ── Footer ── */}
          <Section style={footerSection}>
            <Text style={footer}>
              © {new Date().getFullYear()} NeoHW. Todos los derechos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OtpEmail;

// ── Estilos ──────────────────────────────────────────────

const main = {
  backgroundColor: '#f4f4f5',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  padding: '20px 0',
};

const container = {
  margin: '0 auto',
  width: '100%',
  maxWidth: '640px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #e4e4e7',
};

const headerSection = {
  backgroundColor: '#0f172a',
  padding: '28px 20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const bodySection = {
  padding: '32px 28px 20px',
};

const emoji = {
  fontSize: '40px',
  textAlign: 'center' as const,
  margin: '0 0 8px',
};

const h1 = {
  color: '#0f172a',
  fontSize: '22px',
  fontWeight: '700',
  lineHeight: '30px',
  margin: '0 0 12px',
  textAlign: 'center' as const,
};

const text = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '22px',
  textAlign: 'center' as const,
  margin: '0 0 20px',
};

const codeContainer = {
  backgroundColor: '#f0fdfa',
  border: '2px dashed #0891b2',
  borderRadius: '8px',
  margin: '0 auto 24px',
  padding: '20px',
  maxWidth: '280px',
  textAlign: 'center' as const,
};

const code = {
  color: '#0891b2',
  fontSize: '36px',
  fontWeight: '700',
  letterSpacing: '8px',
  lineHeight: '40px',
  margin: '0',
};

const warningBox = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  border: '1px solid #fde68a',
  padding: '14px 20px',
  margin: '0',
};

const warningText = {
  color: '#92400e',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
};

const footerSection = {
  backgroundColor: '#f8fafc',
  borderTop: '1px solid #e2e8f0',
  padding: '20px',
  textAlign: 'center' as const,
};

const footer = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '0',
};
