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
          <Section style={logoContainer}>
            <Img
              src="https://res.cloudinary.com/dkmqkhlhf/image/upload/v1781135156/logoHW-removebg-preview_bt0mwm.png"
              width="180"
              alt="NeoHW Logo"
              style={logo}
            />
          </Section>

          <Heading style={h1}>Código de Seguridad</Heading>
          
          <Text style={text}>
            Has solicitado un código para: <strong>{purpose}</strong>.
          </Text>

          <Section style={codeContainer}>
            <Text style={code}>{validationCode}</Text>
          </Section>

          <Text style={text}>
            Ingresa este código en la aplicación para continuar. Este código expirará en 15 minutos.
            Si no solicitaste este código, puedes ignorar este correo de forma segura.
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} NeoHW. Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OtpEmail;

const main = {
  backgroundColor: '#0B1120', // Azul muy oscuro/negro
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '560px',
  backgroundColor: '#1E293B', // Azul oscuro
  borderRadius: '8px',
  overflow: 'hidden',
  marginTop: '40px',
};

const logoContainer = {
  padding: '30px 20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#00f0ff', // Celeste neón
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#cbd5e1', // Gris claro
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const codeContainer = {
  background: 'rgba(0, 240, 255, 0.1)',
  border: '1px solid #00f0ff',
  borderRadius: '4px',
  margin: '16px auto 24px',
  padding: '20px',
  width: '280px',
  textAlign: 'center' as const,
};

const code = {
  color: '#00f0ff',
  fontSize: '36px',
  fontWeight: '700',
  letterSpacing: '8px',
  lineHeight: '40px',
  margin: '0',
};

const footer = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '24px',
  marginTop: '48px',
  textAlign: 'center' as const,
};
