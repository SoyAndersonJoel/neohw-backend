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

interface RoleChangeEmailProps {
  firstName: string;
  newRole: string;
}

export const RoleChangeEmail = ({ firstName = 'Usuario', newRole = 'SELLER' }: RoleChangeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Actualización importante de tu cuenta en NeoHW</Preview>
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
            <Text style={emoji}>🎉</Text>
            <Heading style={h1}>¡Felicidades, {firstName}!</Heading>
            
            <Text style={text}>
              Tu cuenta en NeoHW ha sido promovida. A partir de ahora tienes el rol de:
            </Text>

            <Section style={roleContainer}>
              <Text style={roleText}>{newRole}</Text>
            </Section>

            <Section style={infoBox}>
              <Text style={infoText}>
                💡 Cierra sesión y vuelve a entrar para acceder a las nuevas funcionalidades y paneles de control. ¡Estamos emocionados de que formes parte de nuestro equipo!
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

export default RoleChangeEmail;

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

const roleContainer = {
  backgroundColor: '#f0fdfa',
  border: '2px solid #0891b2',
  borderRadius: '8px',
  margin: '0 auto 24px',
  padding: '12px 24px',
  maxWidth: '220px',
  textAlign: 'center' as const,
};

const roleText = {
  color: '#0891b2',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const infoBox = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  border: '1px solid #bfdbfe',
  padding: '14px 20px',
  margin: '0',
};

const infoText = {
  color: '#1e40af',
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
