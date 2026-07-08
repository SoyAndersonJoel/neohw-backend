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
  Hr,
  Column,
  Row,
} from '@react-email/components';

interface OrderInvoiceEmailProps {
  firstName: string;
  trackingCode: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  shippingAddress: string;
}

export const OrderInvoiceEmail = ({
  firstName = 'Cliente',
  trackingCode = 'HW-0000-XXXX',
  items = [],
  subtotal = '0.00',
  taxAmount = '0.00',
  totalAmount = '0.00',
  shippingAddress = 'Dirección no especificada',
}: OrderInvoiceEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Recibo de tu compra en NeoHW</Preview>
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

          <Heading style={h1}>¡Gracias por tu compra, {firstName}!</Heading>
          
          <Text style={text}>
            Hemos recibido tu pago exitosamente. Aquí tienes el recibo y los detalles de tu pedido.
          </Text>

          <Section style={orderInfoBox}>
            <Text style={orderInfoText}>
              <strong>Código de Rastreo:</strong> {trackingCode}
            </Text>
            <Text style={orderInfoText}>
              <strong>Dirección de Envío:</strong> {shippingAddress}
            </Text>
          </Section>

          <Hr style={divider} />
          
          <Heading as="h2" style={h2}>Detalles del Pedido</Heading>

          <Section style={tableSection}>
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemDetailsColumn}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemQty}>Cantidad: {item.quantity}</Text>
                </Column>
                <Column style={itemPriceColumn}>
                  <Text style={itemPrice}>${item.price}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={divider} />

          <Section style={totalsSection}>
            <Row>
              <Column style={totalsLabelColumn}><Text style={totalsText}>Subtotal:</Text></Column>
              <Column style={totalsValueColumn}><Text style={totalsText}>${subtotal}</Text></Column>
            </Row>
            <Row>
              <Column style={totalsLabelColumn}><Text style={totalsText}>IVA (15%):</Text></Column>
              <Column style={totalsValueColumn}><Text style={totalsText}>${taxAmount}</Text></Column>
            </Row>
            <Row>
              <Column style={totalsLabelColumn}><Text style={totalLabelText}>Total Pagado:</Text></Column>
              <Column style={totalsValueColumn}><Text style={totalValueText}>${totalAmount}</Text></Column>
            </Row>
          </Section>

          <Text style={footerText}>
            En breve prepararemos tu pedido para el envío. Te notificaremos cuando esté en camino.
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} NeoHW. Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderInvoiceEmail;

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

const h2 = {
  color: '#f8fafc',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 40px 10px',
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
  margin: '0 40px',
  padding: '16px',
};

const orderInfoText = {
  color: '#e2e8f0',
  fontSize: '14px',
  margin: '4px 0',
};

const divider = {
  borderColor: '#334155',
  margin: '20px 40px',
};

const tableSection = {
  padding: '0 40px',
};

const itemRow = {
  paddingBottom: '10px',
};

const itemDetailsColumn = {
  width: '70%',
};

const itemName = {
  color: '#e2e8f0',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const itemQty = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '4px 0 0',
};

const itemPriceColumn = {
  width: '30%',
  textAlign: 'right' as const,
};

const itemPrice = {
  color: '#00f0ff',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const totalsSection = {
  padding: '0 40px',
};

const totalsLabelColumn = {
  width: '70%',
  textAlign: 'right' as const,
  paddingRight: '20px',
};

const totalsValueColumn = {
  width: '30%',
  textAlign: 'right' as const,
};

const totalsText = {
  color: '#94a3b8',
  fontSize: '14px',
  margin: '4px 0',
};

const totalLabelText = {
  color: '#f8fafc',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '10px 0 4px',
};

const totalValueText = {
  color: '#00f0ff',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '10px 0 4px',
};

const footerText = {
  color: '#cbd5e1',
  fontSize: '14px',
  lineHeight: '22px',
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
