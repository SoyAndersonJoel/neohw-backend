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
          {/* ── Header con logo ── */}
          <Section style={headerSection}>
            <Img
              src="https://res.cloudinary.com/dkmqkhlhf/image/upload/v1781135156/logoHW-removebg-preview_bt0mwm.png"
              width="140"
              alt="NeoHW Logo"
              style={logo}
            />
          </Section>

          {/* ── Saludo ── */}
          <Section style={bodySection}>
            <Heading style={h1}>¡Gracias por tu compra, {firstName}!</Heading>
            
            <Text style={text}>
              Hemos recibido tu pago exitosamente. Aquí tienes el recibo y los detalles de tu pedido.
            </Text>

            {/* ── Info del pedido ── */}
            <Section style={orderInfoBox}>
              <Row>
                <Column>
                  <Text style={orderInfoLabel}>Código de Rastreo</Text>
                  <Text style={orderInfoValue}>{trackingCode}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={orderInfoLabel}>Dirección de Envío</Text>
                  <Text style={orderInfoValue}>{shippingAddress}</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={divider} />
            
            <Heading as="h2" style={h2}>Detalles del Pedido</Heading>

            {/* ── Cabecera de tabla ── */}
            <Section style={tableContainer}>
              <Row style={tableHeaderRow}>
                <Column style={colProduct}><Text style={tableHeaderText}>Producto</Text></Column>
                <Column style={colUnitPrice}><Text style={tableHeaderTextRight}>P. Unit.</Text></Column>
                <Column style={colQty}><Text style={tableHeaderTextCenter}>Cant.</Text></Column>
                <Column style={colSubtotal}><Text style={tableHeaderTextRight}>Subtotal</Text></Column>
              </Row>

              {/* ── Filas de productos ── */}
              {items.map((item, index) => {
                const unitPrice = parseFloat(item.price);
                const lineTotal = (unitPrice * item.quantity).toFixed(2);
                return (
                  <Row key={index} style={index % 2 === 0 ? tableRowEven : tableRowOdd}>
                    <Column style={colProduct}><Text style={cellText}>{item.name}</Text></Column>
                    <Column style={colUnitPrice}><Text style={cellTextRight}>${item.price}</Text></Column>
                    <Column style={colQty}><Text style={cellTextCenter}>{item.quantity}</Text></Column>
                    <Column style={colSubtotal}><Text style={cellTextRightBold}>${lineTotal}</Text></Column>
                  </Row>
                );
              })}
            </Section>

            {/* ── Totales ── */}
            <Section style={totalsBox}>
              <Row>
                <Column style={totalsLabelCol}><Text style={totalsLabel}>Subtotal:</Text></Column>
                <Column style={totalsValueCol}><Text style={totalsValue}>${subtotal}</Text></Column>
              </Row>
              <Row>
                <Column style={totalsLabelCol}><Text style={totalsLabel}>IVA (15%):</Text></Column>
                <Column style={totalsValueCol}><Text style={totalsValue}>${taxAmount}</Text></Column>
              </Row>
              <Hr style={totalsDivider} />
              <Row>
                <Column style={totalsLabelCol}><Text style={totalFinalLabel}>Total Pagado:</Text></Column>
                <Column style={totalsValueCol}><Text style={totalFinalValue}>${totalAmount}</Text></Column>
              </Row>
            </Section>

            <Text style={footerMessage}>
              En breve prepararemos tu pedido para el envío. Te notificaremos cuando esté en camino. 📦
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

export default OrderInvoiceEmail;

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

const h1 = {
  color: '#0f172a',
  fontSize: '22px',
  fontWeight: '700',
  lineHeight: '30px',
  margin: '0 0 12px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const text = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '22px',
  textAlign: 'center' as const,
  margin: '0 0 20px',
};

const orderInfoBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  padding: '16px 20px',
  margin: '0 0 20px',
};

const orderInfoLabel = {
  color: '#94a3b8',
  fontSize: '11px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '8px 0 2px',
};

const orderInfoValue = {
  color: '#1e293b',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 4px',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '20px 0',
};

// ── Tabla de productos ──
const tableContainer = {
  width: '100%',
  margin: '0 0 8px',
};

const tableHeaderRow = {
  backgroundColor: '#f1f5f9',
  borderBottom: '2px solid #e2e8f0',
};

const tableHeaderText = {
  color: '#64748b',
  fontSize: '11px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  padding: '10px 8px',
  margin: '0',
};

const tableHeaderTextRight = {
  ...tableHeaderText,
  textAlign: 'right' as const,
};

const tableHeaderTextCenter = {
  ...tableHeaderText,
  textAlign: 'center' as const,
};

const colProduct = { width: '40%' };
const colUnitPrice = { width: '20%' };
const colQty = { width: '15%' };
const colSubtotal = { width: '25%' };

const tableRowEven = {
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #f1f5f9',
};

const tableRowOdd = {
  backgroundColor: '#fafafa',
  borderBottom: '1px solid #f1f5f9',
};

const cellText = {
  color: '#334155',
  fontSize: '13px',
  padding: '10px 8px',
  margin: '0',
  wordBreak: 'break-word' as const,
};

const cellTextRight = {
  ...cellText,
  textAlign: 'right' as const,
  color: '#475569',
};

const cellTextCenter = {
  ...cellText,
  textAlign: 'center' as const,
  color: '#475569',
};

const cellTextRightBold = {
  ...cellText,
  textAlign: 'right' as const,
  fontWeight: '600',
  color: '#0f172a',
};

// ── Totales ──
const totalsBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  padding: '16px 20px',
  margin: '16px 0 20px',
};

const totalsLabelCol = {
  width: '65%',
  textAlign: 'right' as const,
  paddingRight: '16px',
};

const totalsValueCol = {
  width: '35%',
  textAlign: 'right' as const,
};

const totalsLabel = {
  color: '#64748b',
  fontSize: '13px',
  margin: '4px 0',
};

const totalsValue = {
  color: '#334155',
  fontSize: '13px',
  margin: '4px 0',
};

const totalsDivider = {
  borderColor: '#cbd5e1',
  margin: '8px 0',
};

const totalFinalLabel = {
  color: '#0f172a',
  fontSize: '15px',
  fontWeight: '700',
  margin: '4px 0',
};

const totalFinalValue = {
  color: '#0891b2',
  fontSize: '15px',
  fontWeight: '700',
  margin: '4px 0',
};

const footerMessage = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '22px',
  textAlign: 'center' as const,
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
