import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { styles } from "./theme";

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html lang="ro">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading as="h1" style={styles.brand}>
              Dostore <span style={styles.brandAccent}>Carti</span>
            </Heading>
          </Section>

          <Section style={styles.content}>{children}</Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Dostore Carti — librăria ta online din Moldova.
              <br />
              Str. Ismail 47, Chișinău · +373 22 000 000 · contact@bookstore.md
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
