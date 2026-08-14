import { Button, Column, Hr, Row, Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";
import { styles } from "./theme";
import { formatPrice } from "@/lib/format";
import type { OrderEmailData } from "@/lib/email/types";
import { formatShippingAddress } from "@/lib/orders/address";

export function OrderConfirmationEmail({
  order,
  trackingUrl,
  paymentUrl,
}: {
  order: OrderEmailData;
  trackingUrl?: string;
  /** Pagina de plată — doar la comenzile online. */
  paymentUrl?: string;
}) {
  const firstName = order.customerName.split(" ")[0] || order.customerName;

  // La plata la livrare nu există nicio plată online de confirmat — promisiunea
  // „te anunțăm când plata e confirmată" era derutantă exact pentru clienții
  // care aleseseră plata la curier.
  const payOnDelivery =
    order.paymentMethod === "CASH_ON_DELIVERY" || order.paymentMethod === "CARD_ON_DELIVERY";
  const payLabel =
    order.paymentMethod === "CASH_ON_DELIVERY"
      ? "numerar la livrare"
      : order.paymentMethod === "CARD_ON_DELIVERY"
        ? "card la livrare"
        : "online, pe site";

  return (
    <EmailLayout preview={`Am primit comanda ta ${order.orderNumber}`}>
      <Text style={styles.heading}>Îți mulțumim, {firstName}!</Text>
      <Text style={styles.paragraph}>
        Am primit comanda ta cu numărul{" "}
        <span style={styles.strong}>{order.orderNumber}</span>.{" "}
        {payOnDelivery ? (
          <>
            Îți pregătim comanda și o predăm curierului — te anunțăm de îndată ce pleacă spre
            tine. Plătești <span style={styles.strong}>{payLabel}</span>, direct curierului,
            când primești coletul.
          </>
        ) : (
          <>
            Ai ales plata prin <span style={styles.strong}>MIA Plăți Instant</span>. Dacă ai
            achitat deja, e totul în regulă — primești separat bonul electronic, iar noi
            pregătim coletul. Dacă n-ai apucat să finalizezi plata, o poți face din butonul
            de mai jos.
          </>
        )}
      </Text>

      <Section style={styles.infoBox}>
        <Text style={styles.label}>Livrare la</Text>
        <Text style={styles.value}>{order.customerName}</Text>
        <Text style={{ ...styles.value, fontWeight: 400 }}>
          {formatShippingAddress(order)}, {order.city}
        </Text>
        <Text style={{ ...styles.value, fontWeight: 400 }}>{order.customerPhone}</Text>
        {order.customerNote && (
          <Text style={{ ...styles.value, fontWeight: 400, fontStyle: "italic" }}>
            Mesaj pentru curier: {order.customerNote}
          </Text>
        )}
      </Section>

      <Text style={{ ...styles.strong, fontSize: "15px", margin: "0 0 8px" }}>
        Produsele tale
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

      {/* La plata online butonul duce la pagina de plată: dacă e deja achitată,
          acea pagină trimite singură clientul la comanda lui, deci linkul e bun
          în ambele situații. */}
      {!payOnDelivery && paymentUrl ? (
        <Section style={{ textAlign: "center", marginTop: "24px" }}>
          <Button href={paymentUrl} style={styles.button}>
            Finalizează plata
          </Button>
        </Section>
      ) : (
        trackingUrl && (
          <Section style={{ textAlign: "center", marginTop: "24px" }}>
            <Button href={trackingUrl} style={styles.button}>
              Urmărește comanda
            </Button>
          </Section>
        )
      )}

      <Text style={{ ...styles.paragraph, margin: "24px 0 0" }}>
        Ai întrebări despre comandă? Răspunde la acest email sau scrie-ne la
        dostore.moldova@gmail.com.
      </Text>
    </EmailLayout>
  );
}
