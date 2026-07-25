import { Button, Section, Text } from "@react-email/components";
import type { OrderStatus } from "@prisma/client";
import { EmailLayout } from "./EmailLayout";
import { styles } from "./theme";
import { STATUS_EMAIL } from "@/lib/orders/status";

export function OrderStatusUpdateEmail({
  customerName,
  orderNumber,
  status,
  trackingUrl,
  trackingNumber,
}: {
  customerName: string;
  orderNumber: string;
  status: OrderStatus;
  trackingUrl: string;
  trackingNumber?: string | null;
}) {
  const copy = STATUS_EMAIL[status];
  const firstName = customerName.split(" ")[0] || customerName;
  const heading = copy?.heading ?? "Actualizare comandă";
  const body = copy?.body ?? "Statusul comenzii tale s-a actualizat.";

  return (
    <EmailLayout preview={`${heading} — comanda ${orderNumber}`}>
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.paragraph}>
        Bună, {firstName}! {body}
      </Text>

      <Section style={styles.infoBox}>
        <Text style={styles.label}>Număr comandă</Text>
        <Text style={styles.value}>{orderNumber}</Text>
        {trackingNumber ? (
          <>
            <Text style={{ ...styles.label, margin: "10px 0 4px" }}>Număr urmărire (AWB)</Text>
            <Text style={styles.value}>{trackingNumber}</Text>
          </>
        ) : null}
      </Section>

      <Section style={{ textAlign: "center", marginTop: "24px" }}>
        <Button href={trackingUrl} style={styles.button}>
          Urmărește comanda
        </Button>
      </Section>

      <Text style={{ ...styles.paragraph, margin: "24px 0 0" }}>
        Ai întrebări? Sună-ne la +373 68 812 853 sau răspunde la acest email.
      </Text>
    </EmailLayout>
  );
}
