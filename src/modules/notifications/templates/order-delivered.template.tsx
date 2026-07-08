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
            <Text style={emoji}>✅</Text>
            <Heading style={h1}>¡Pedido Entregado, {firstName}!</Heading>
            
            <Text style={text}>
              Te confirmamos que tu pedido con código de rastreo <strong>{trackingCode}</strong> ha sido entregado exitosamente.
            </Text>

            <Section style={successBox}>
              <Text style={successText}>
                🎉 Esperamos que disfrutes de tu nuevo hardware. Si tienes alguna duda sobre la instalación o garantía, no dudes en contactarnos o consultar con nuestro Asistente de IA en la tienda.
              </Text>
            </Section>

            <Text style={thankYou}>
              ¡Gracias por confiar en NeoHW para armar tu PC perfecta!
            </Text>
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

export default OrderDeliveredEmail;

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
  margin: '0 0 24px',
};

const successBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  border: '1px solid #bbf7d0',
  padding: '16px 20px',
  margin: '0 0 24px',
};

const successText = {
  color: '#166534',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
};

const thankYou = {
  color: '#0891b2',
  fontSize: '16px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '0 0 8px',
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
