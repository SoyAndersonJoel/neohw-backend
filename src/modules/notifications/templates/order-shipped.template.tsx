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

interface OrderShippedEmailProps {
  firstName: string;
  trackingCode: string;
  shippingAddress: string;
}

export const OrderShippedEmail = ({
  firstName = 'Cliente',
  trackingCode = 'HW-0000-XXXX',
  shippingAddress = 'Dirección no especificada',
}: OrderShippedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>¡Tu pedido de NeoHW está en camino!</Preview>
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

          <Heading style={h1}>¡Excelentes noticias, {firstName}!</Heading>
          
          <Text style={text}>
            Tu pedido ha sido empacado y entregado al transportista. ¡Ya está en camino hacia ti!
          </Text>

          <Section style={orderInfoBox}>
            <Text style={orderInfoText}>
              <strong>Código de Rastreo:</strong> {trackingCode}
            </Text>
            <Text style={orderInfoText}>
              <strong>Dirección de Entrega:</strong> {shippingAddress}
            </Text>
          </Section>

          <Text style={text}>
            Por favor asegúrate de que haya alguien en la dirección indicada para recibir y firmar la entrega del paquete.
            Para revisar el estado exacto, puedes usar tu código de rastreo en nuestro portal.
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} NeoHW. Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderShippedEmail;

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
  textAlign: 'center' as const,
};

const orderInfoBox = {
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '6px',
  margin: '20px 40px',
  padding: '16px',
};

const orderInfoText = {
  color: '#e2e8f0',
  fontSize: '14px',
  margin: '4px 0',
};

const footer = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '24px',
  marginTop: '48px',
  textAlign: 'center' as const,
};
