import { Button, Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";
import { styles } from "./theme";

/**
 * Emailul trimis clientului când comanda online n-a fost achitată și codul MIA
 * a expirat.
 *
 * De ce există: codul QR trăiește 30 de minute. Cine e întrerupt între timp
 * revenea la un cod mort — iar comanda se anula automat, în tăcere. Magazinul
 * primea o notificare pe Telegram, clientul nimic. 13 comenzi reale, de aproape
 * 6000 de lei, s-au pierdut așa. Pagina de plată știe deja să elibereze un cod
 * nou și să reactiveze comanda; lipsea doar ca cineva să-i spună clientului.
 */
export function PaymentExpiredEmail({
  customerName,
  orderNumber,
  total,
  paymentUrl,
}: {
  customerName: string;
  orderNumber: string;
  total: number;
  paymentUrl: string;
}) {
  const firstName = customerName.split(" ")[0] || customerName;

  return (
    <EmailLayout preview={`Comanda ${orderNumber} te mai așteaptă`}>
      <Text style={styles.heading}>Comanda ta te mai așteaptă</Text>
      <Text style={styles.paragraph}>
        Bună, {firstName}! Codul de plată pentru comanda {orderNumber} a expirat înainte să apuci
        să achiți — codurile MIA sunt valabile 30 de minute.
      </Text>
      <Text style={styles.paragraph}>
        Produsele sunt încă rezervate. Apasă butonul de mai jos, ceri un cod nou și plătești în
        câteva secunde.
      </Text>

      <Section style={styles.infoBox}>
        <Text style={styles.label}>Comandă</Text>
        <Text style={styles.value}>{orderNumber}</Text>
        <Text style={{ ...styles.label, margin: "10px 0 4px" }}>Total</Text>
        <Text style={styles.value}>{total.toFixed(2)} lei</Text>
      </Section>

      <Section style={{ textAlign: "center", marginTop: "24px" }}>
        <Button href={paymentUrl} style={styles.button}>
          Generează un cod nou și plătește
        </Button>
      </Section>

      <Text style={{ ...styles.paragraph, margin: "24px 0 0" }}>
        Preferi să plătești la primirea coletului? Sună-ne la +373 68 812 853 sau răspunde la acest
        email și schimbăm noi metoda de plată — nu trebuie să comanzi din nou.
      </Text>
    </EmailLayout>
  );
}
