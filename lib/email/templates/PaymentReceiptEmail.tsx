import { Button, Column, Hr, Img, Row, Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";
import { styles } from "./theme";
import { formatPrice } from "@/lib/format";
import { formatShippingAddress } from "@/lib/orders/address";
import { SITE_URL } from "@/lib/site";
import type { OrderEmailItem } from "@/lib/email/types";

/**
 * Bonul electronic trimis clientului DUPĂ ce plata a fost confirmată de bancă.
 *
 * Cerut expres la verificarea BNM: clientul trebuie să primească pe email
 * dovada cumpărăturii, cu datele vânzătorului, ce a cumpărat, cât a plătit,
 * cum a plătit (MIA Plăți Instant) și referința tranzacției de la bancă.
 */
export type PaymentReceiptData = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  building?: string | null;
  apartment?: string | null;
  city: string;
  items: OrderEmailItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  /** Referința tranzacției primită de la bancă (identifică plata în extras). */
  paymentReference?: string | null;
  /** Momentul confirmării plății. */
  paidAt: Date;
};

// Fără adresa sediului: emailurile ajung la clienți, iar adresa juridică nu are
// ce căuta în ele (rămâne pe paginile Termeni și Confidențialitate). Restul —
// denumire, cod fiscal, IBAN, contact — sunt necesare pe un document de plată.
const SELLER = {
  name: "Free Life SRL",
  fiscalCode: "1025600059594",
  iban: "MD46VI022511400000572MDL, VictoriaBank",
  email: "dostore.moldova@gmail.com",
  phone: "+373 68 812 853",
};

const DATE_TIME = new Intl.DateTimeFormat("ro-RO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Chisinau",
});

export function PaymentReceiptEmail({ receipt }: { receipt: PaymentReceiptData }) {
  const firstName = receipt.customerName.split(" ")[0] || receipt.customerName;

  return (
    <EmailLayout preview={`Bon electronic — comanda ${receipt.orderNumber}`}>
      <Text style={styles.heading}>Plata a fost confirmată</Text>
      <Text style={styles.paragraph}>
        Bună, {firstName}! Am primit plata pentru comanda{" "}
        <span style={styles.strong}>{receipt.orderNumber}</span>. Mai jos ai bonul electronic
        cu tot ce ai cumpărat — păstrează-l ca dovadă a plății.
      </Text>

      {/* Plata */}
      <Section style={styles.infoBox}>
        <Row>
          <Column>
            <Text style={styles.label}>Metoda de plată</Text>
            <Text style={styles.value}>MIA Plăți Instant (MIA Instant Payments)</Text>
          </Column>
          <Column style={{ width: "110px", textAlign: "right" }}>
            <Img
              src={`${SITE_URL}/plati/mia-logo.png`}
              alt="MIA Plăți Instant"
              width="100"
              height="19"
            />
          </Column>
        </Row>
        <Text style={{ ...styles.label, margin: "10px 0 4px" }}>Data și ora plății</Text>
        <Text style={{ ...styles.value, fontWeight: 400 }}>
          {DATE_TIME.format(new Date(receipt.paidAt))}
        </Text>
        {receipt.paymentReference && (
          <>
            <Text style={{ ...styles.label, margin: "10px 0 4px" }}>Referința tranzacției</Text>
            <Text style={{ ...styles.value, fontWeight: 400, fontSize: "12px", wordBreak: "break-all" }}>
              {receipt.paymentReference}
            </Text>
          </>
        )}
        <Text style={{ ...styles.label, margin: "10px 0 4px" }}>Sumă achitată</Text>
        <Text style={styles.value}>{formatPrice(receipt.total)}</Text>
      </Section>

      {/* Ce a cumpărat */}
      <Text style={{ ...styles.strong, fontSize: "15px", margin: "0 0 8px" }}>
        Ce ai cumpărat
      </Text>
      {receipt.items.map((item, index) => (
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
            <Text style={styles.totalLabel}>Produse</Text>
          </Column>
          <Column style={{ width: "120px" }}>
            <Text style={styles.totalValue}>{formatPrice(receipt.subtotal)}</Text>
          </Column>
        </Row>
        <Row style={styles.totalRow}>
          <Column>
            <Text style={styles.totalLabel}>Livrare prin curier</Text>
          </Column>
          <Column style={{ width: "120px" }}>
            <Text style={styles.totalValue}>{formatPrice(receipt.shippingCost)}</Text>
          </Column>
        </Row>
        <Hr style={styles.hr} />
        <Row>
          <Column>
            <Text style={styles.grandTotalLabel}>Total achitat</Text>
          </Column>
          <Column style={{ width: "120px" }}>
            <Text style={styles.grandTotalValue}>{formatPrice(receipt.total)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Livrare */}
      <Section style={{ ...styles.infoBox, marginTop: "20px" }}>
        <Text style={styles.label}>Livrare la</Text>
        <Text style={styles.value}>{receipt.customerName}</Text>
        <Text style={{ ...styles.value, fontWeight: 400 }}>
          {formatShippingAddress(receipt)}, {receipt.city}
        </Text>
        <Text style={{ ...styles.value, fontWeight: 400 }}>
          {receipt.customerPhone} · {receipt.customerEmail}
        </Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "20px 0 8px" }}>
        <Button href={`${SITE_URL}/comanda/${receipt.orderNumber}`} style={styles.button}>
          Vezi comanda
        </Button>
      </Section>

      {/* Datele vânzătorului — obligatorii pe un document de plată. */}
      <Hr style={styles.hr} />
      <Text style={{ ...styles.itemMeta, lineHeight: "1.7" }}>
        <span style={styles.strong}>Vânzător:</span> {SELLER.name}, cod fiscal{" "}
        {SELLER.fiscalCode}
        <br />
        IBAN: {SELLER.iban}
        <br />
        {SELLER.phone} · {SELLER.email}
        <br />
        <br />
        Documentul confirmă plata efectuată prin MIA Plăți Instant și ține loc de bon
        electronic. Dacă ai nevoie de factură fiscală pe persoană juridică, scrie-ne la{" "}
        {SELLER.email} cu datele firmei.
      </Text>
    </EmailLayout>
  );
}
