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

interface OrderDeliveredEmailProps {
  firstName: string;
  trackingCode: string;
}

export const OrderDeliveredEmail = ({
  firstName = 'Cliente',
  trackingCode = 'HW-0000-XXXX',
}: OrderDeliveredEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>¡Tu pedido de NeoHW ha sido entregado!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://res.cloudinary.com/dkmqkhlhf/image/upload/v1781135156/logoHW-removebg-preview_bt0mwm.png"
              width="150"
              alt="NeoHW Logo"
              style={logo}
            />
          </Section>

          <Heading style={h1}>¡Pedido Entregado, {firstName}!</Heading>
          
          <Text style={text}>
            Te confirmamos que tu pedido con código de rastreo <strong>{trackingCode}</strong> ha sido entregado exitosamente.
          </Text>

          <Text style={text}>
            Esperamos que disfrutes de tu nuevo hardware. Si tienes alguna duda sobre la instalación o garantía, no dudes en contactarnos o consultar con nuestro Asistente de IA en la tienda.
          </Text>

          <Text style={footerText}>
            ¡Gracias por confiar en NeoHW para armar tu PC perfecta!
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} NeoHW. Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderDeliveredEmail;

const main = {
  backgroundColor: '#0B1120',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '600px',
  backgroundColor: '#1E293B',
  borderRadius: '8px',
  overflow: 'hidden',
  marginTop: '40px',
};

const logoContainer = {
  padding: '20px',
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
  fontSize: '15px',
  lineHeight: '24px',
  padding: '0 40px',
  margin: '10px 0',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#00f0ff',
  fontSize: '16px',
  fontWeight: 'bold',
  lineHeight: '24px',
  padding: '20px 40px 0',
  textAlign: 'center' as const,
};

const footer = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '24px',
  marginTop: '48px',
  textAlign: 'center' as const,
};
