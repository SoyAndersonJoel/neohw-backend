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
            <Text style={emoji}>🚚</Text>
            <Heading style={h1}>¡Tu pedido está en camino, {firstName}!</Heading>
            
            <Text style={text}>
              Tu pedido ha sido empacado y entregado al transportista. ¡Ya está en camino hacia ti!
            </Text>

            <Section style={infoBox}>
              <Text style={infoLabel}>Código de Rastreo</Text>
              <Text style={infoValueHighlight}>{trackingCode}</Text>
            </Section>

            <Section style={infoBox}>
              <Text style={infoLabel}>Dirección de Entrega</Text>
              <Text style={infoValue}>{shippingAddress}</Text>
            </Section>

            <Section style={tipBox}>
              <Text style={tipText}>
                📋 Asegúrate de que haya alguien en la dirección indicada para recibir y firmar la entrega del paquete.
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

export default OrderShippedEmail;

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

const infoBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  padding: '14px 20px',
  margin: '0 0 12px',
};

const infoLabel = {
  color: '#94a3b8',
  fontSize: '11px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
};

const infoValue = {
  color: '#1e293b',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const infoValueHighlight = {
  color: '#0891b2',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '0.5px',
};

const tipBox = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  border: '1px solid #bfdbfe',
  padding: '14px 20px',
  margin: '20px 0 0',
};

const tipText = {
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
