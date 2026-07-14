import { Button, Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";
import { styles } from "./theme";

export function NewsletterWelcomeEmail({ siteUrl }: { siteUrl: string }) {
  return (
    <EmailLayout preview="Bine ai venit în comunitatea Dostore Carti">
      <Text style={styles.heading}>Bine ai venit! 📚</Text>
      <Text style={styles.paragraph}>
        Îți mulțumim că te-ai abonat la newsletterul Dostore Carti. De acum vei primi primul
        printre cititori:
      </Text>

      <Section style={styles.infoBox}>
        <Text style={{ ...styles.value, fontWeight: 400, margin: "0 0 6px" }}>
          • Recomandări de lectură alese cu grijă
        </Text>
        <Text style={{ ...styles.value, fontWeight: 400, margin: "0 0 6px" }}>
          • Noutăți editoriale și titluri în avanpremieră
        </Text>
        <Text style={{ ...styles.value, fontWeight: 400, margin: 0 }}>
          • Reduceri și oferte speciale, doar pentru abonați
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        Până atunci, aruncă o privire peste cele mai iubite cărți ale momentului.
      </Text>

      <Section style={{ textAlign: "center", marginTop: "24px" }}>
        <Button href={`${siteUrl}/carti/bestsellers`} style={styles.button}>
          Vezi bestsellers
        </Button>
      </Section>
    </EmailLayout>
  );
}
