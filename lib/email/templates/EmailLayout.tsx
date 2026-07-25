import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { styles } from "./theme";
import { SITE_URL } from "@/lib/site";

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
            <Row>
              <Column style={{ width: "52px" }}>
                <Img
                  src={`${SITE_URL}/icon-192.png`}
                  alt="Dostore Carti"
                  width="44"
                  height="44"
                  style={{ borderRadius: "50%", display: "block" }}
                />
              </Column>
              <Column>
                <Heading as="h1" style={styles.brand}>
                  Dostore <span style={styles.brandAccent}>Carti</span>
                </Heading>
              </Column>
            </Row>
          </Section>

          <Section style={styles.content}>{children}</Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Dostore Carti — librăria ta online din Moldova.
              <br />
              Str. Ismail 47, Chișinău · +373 68 812 853 · dostore.moldova@gmail.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
