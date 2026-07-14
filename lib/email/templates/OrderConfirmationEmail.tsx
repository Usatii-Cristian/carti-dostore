import { Column, Hr, Row, Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";
import { styles } from "./theme";
import { formatPrice } from "@/lib/format";
import type { OrderEmailData } from "@/lib/email/types";

export function OrderConfirmationEmail({ order }: { order: OrderEmailData }) {
  const firstName = order.customerName.split(" ")[0] || order.customerName;

  return (
    <EmailLayout preview={`Am primit comanda ta ${order.orderNumber}`}>
      <Text style={styles.heading}>Îți mulțumim, {firstName}!</Text>
      <Text style={styles.paragraph}>
        Am primit comanda ta cu numărul{" "}
        <span style={styles.strong}>{order.orderNumber}</span>. Îți pregătim cărțile cu
        grijă — vei primi un mesaj de îndată ce plata e confirmată și comanda pleacă spre
        tine.
      </Text>

      <Section style={styles.infoBox}>
        <Text style={styles.label}>Livrare la</Text>
        <Text style={styles.value}>{order.customerName}</Text>
        <Text style={{ ...styles.value, fontWeight: 400 }}>
          {order.shippingAddress}, {order.city}
        </Text>
        <Text style={{ ...styles.value, fontWeight: 400 }}>{order.customerPhone}</Text>
      </Section>

      <Text style={{ ...styles.strong, fontSize: "15px", margin: "0 0 8px" }}>
        Cărțile tale
      </Text>
      {order.items.map((item, index) => (
        <Row key={index} style={styles.itemRow}>
          <Column>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemMeta}>
              {item.quantity} × {formatPrice(item.price)}
            </Text>
          </Column>
          <Column style={{ width: "90px" }}>
            <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
          </Column>
        </Row>
      ))}

      <Section style={{ marginTop: "16px" }}>
        <Row style={styles.totalRow}>
          <Column>
            <Text style={styles.totalLabel}>Subtotal</Text>
          </Column>
          <Column style={{ width: "120px" }}>
            <Text style={styles.totalValue}>{formatPrice(order.subtotal)}</Text>
          </Column>
        </Row>
        <Row style={styles.totalRow}>
          <Column>
            <Text style={styles.totalLabel}>Transport</Text>
          </Column>
          <Column style={{ width: "120px" }}>
            <Text style={styles.totalValue}>
              {order.shippingCost === 0 ? "Gratuit" : formatPrice(order.shippingCost)}
            </Text>
          </Column>
        </Row>
        <Hr style={styles.hr} />
        <Row>
          <Column>
            <Text style={styles.grandTotalLabel}>Total</Text>
          </Column>
          <Column style={{ width: "120px" }}>
            <Text style={styles.grandTotalValue}>{formatPrice(order.total)}</Text>
          </Column>
        </Row>
      </Section>

      <Text style={{ ...styles.paragraph, margin: "24px 0 0" }}>
        Ai întrebări despre comandă? Răspunde la acest email sau scrie-ne la
        contact@bookstore.md.
      </Text>
    </EmailLayout>
  );
}
