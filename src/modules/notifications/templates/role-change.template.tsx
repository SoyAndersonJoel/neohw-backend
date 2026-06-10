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
          <Section style={logoContainer}>
            <Img
              src="https://res.cloudinary.com/dkmqkhlhf/image/upload/v1781135156/logoHW-removebg-preview_bt0mwm.png"
              width="180"
              alt="NeoHW Logo"
              style={logo}
            />
          </Section>

          <Heading style={h1}>¡Felicidades, {firstName}!</Heading>
          
          <Text style={text}>
            Tu cuenta en NeoHW ha sido promovida. A partir de ahora tienes el rol de:
          </Text>

          <Section style={roleContainer}>
            <Text style={roleText}>{newRole}</Text>
          </Section>

          <Text style={text}>
            Cierra sesión y vuelve a entrar para acceder a las nuevas funcionalidades y paneles de control. 
            ¡Estamos emocionados de que formes parte de nuestro equipo!
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} NeoHW. Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default RoleChangeEmail;

const main = {
  backgroundColor: '#0B1120',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '560px',
  backgroundColor: '#1E293B',
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
  color: '#00f0ff',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#cbd5e1',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const roleContainer = {
  background: 'rgba(0, 240, 255, 0.1)',
  border: '1px solid #00f0ff',
  borderRadius: '4px',
  margin: '16px auto 24px',
  padding: '10px 20px',
  width: '200px',
  textAlign: 'center' as const,
};

const roleText = {
  color: '#00f0ff',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
};

const footer = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '24px',
  marginTop: '48px',
  textAlign: 'center' as const,
};
