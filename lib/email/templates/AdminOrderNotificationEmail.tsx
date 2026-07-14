import { Button, Column, Hr, Row, Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";
import { styles } from "./theme";
import { formatPrice } from "@/lib/format";
import type { OrderEmailData } from "@/lib/email/types";

export function AdminOrderNotificationEmail({
  order,
  adminUrl,
}: {
  order: OrderEmailData;
  adminUrl: string;
}) {
  return (
    <EmailLayout preview={`Comandă nouă ${order.orderNumber} — ${formatPrice(order.total)}`}>
      <Text style={styles.heading}>Comandă nouă 🎉</Text>
      <Text style={styles.paragraph}>
        A intrat comanda <span style={styles.strong}>{order.orderNumber}</span> în valoare de{" "}
        <span style={styles.strong}>{formatPrice(order.total)}</span>.
      </Text>

      <Section style={styles.infoBox}>
        <Text style={styles.label}>Client</Text>
        <Text style={styles.value}>{order.customerName}</Text>
        <Text style={{ ...styles.value, fontWeight: 400 }}>{order.customerEmail}</Text>
        <Text style={{ ...styles.value, fontWeight: 400 }}>{order.customerPhone}</Text>
        <Text style={{ ...styles.label, margin: "10px 0 4px" }}>Adresă</Text>
        <Text style={{ ...styles.value, fontWeight: 400 }}>
          {order.shippingAddress}, {order.city}
        </Text>
      </Section>

      <Text style={{ ...styles.strong, fontSize: "15px", margin: "0 0 8px" }}>Produse</Text>
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

      <Hr style={styles.hr} />
      <Row>
        <Column>
          <Text style={styles.grandTotalLabel}>Total</Text>
        </Column>
        <Column style={{ width: "120px" }}>
          <Text style={styles.grandTotalValue}>{formatPrice(order.total)}</Text>
        </Column>
      </Row>

      <Section style={{ textAlign: "center", marginTop: "28px" }}>
        <Button href={adminUrl} style={styles.button}>
          Deschide în panoul de admin
        </Button>
      </Section>
    </EmailLayout>
  );
}
