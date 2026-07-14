import { Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";
import { styles } from "./theme";
import { formatPrice } from "@/lib/format";

export function PaymentConfirmedEmail({
  customerName,
  orderNumber,
  total,
}: {
  customerName: string;
  orderNumber: string;
  total: number;
}) {
  const firstName = customerName.split(" ")[0] || customerName;

  return (
    <EmailLayout preview={`Plata pentru comanda ${orderNumber} a fost confirmată`}>
      <Text style={styles.heading}>Plata a fost confirmată ✅</Text>
      <Text style={styles.paragraph}>
        Bună, {firstName}! Am primit plata de{" "}
        <span style={styles.strong}>{formatPrice(total)}</span> pentru comanda{" "}
        <span style={styles.strong}>{orderNumber}</span>. Totul e în regulă — pregătim
        coletul și îl trimitem spre tine.
      </Text>

      <Section style={styles.infoBox}>
        <Text style={styles.label}>Număr comandă</Text>
        <Text style={styles.value}>{orderNumber}</Text>
        <Text style={{ ...styles.label, margin: "10px 0 4px" }}>Sumă plătită</Text>
        <Text style={styles.value}>{formatPrice(total)}</Text>
      </Section>

      <Text style={styles.paragraph}>
        Vei fi anunțat când comanda pleacă la livrare. Îți mulțumim că ai ales BookStore!
      </Text>
    </EmailLayout>
  );
}
