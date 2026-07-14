// Paleta de brand BookStore, oglindită din app/globals.css. Emailurile au nevoie
// de stiluri inline (clientii de email ignoră CSS extern / clase), deci ținem
// culorile și obiectele de stil refolosibile aici.
export const colors = {
  cream: "#faf5ec",
  creamSoft: "#f2ead9",
  card: "#ffffff",
  navy: "#1b2a4a",
  navyDark: "#121d34",
  terracotta: "#a8461f",
  terracottaDark: "#863818",
  gold: "#d6a028",
  ink: "#2a2622",
  inkSoft: "#6b6459",
  border: "#e6ded0",
} as const;

export const fontStack =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const styles = {
  body: {
    backgroundColor: colors.cream,
    fontFamily: fontStack,
    margin: 0,
    padding: "24px 0",
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: "14px",
    border: `1px solid ${colors.border}`,
    overflow: "hidden" as const,
    maxWidth: "560px",
    margin: "0 auto",
  },
  header: {
    backgroundColor: colors.navy,
    padding: "24px 32px",
  },
  brand: {
    color: colors.cream,
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    margin: 0,
  },
  brandAccent: {
    color: colors.gold,
  },
  content: {
    padding: "32px",
  },
  heading: {
    color: colors.ink,
    fontSize: "20px",
    fontWeight: 700,
    margin: "0 0 12px",
  },
  paragraph: {
    color: colors.inkSoft,
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 16px",
  },
  strong: {
    color: colors.ink,
    fontWeight: 600,
  },
  button: {
    backgroundColor: colors.terracotta,
    color: colors.cream,
    borderRadius: "999px",
    fontSize: "15px",
    fontWeight: 600,
    textDecoration: "none",
    padding: "12px 28px",
    display: "inline-block",
  },
  infoBox: {
    backgroundColor: colors.creamSoft,
    borderRadius: "10px",
    padding: "16px 20px",
    margin: "0 0 20px",
  },
  label: {
    color: colors.inkSoft,
    fontSize: "13px",
    margin: "0 0 4px",
  },
  value: {
    color: colors.ink,
    fontSize: "15px",
    fontWeight: 600,
    margin: 0,
  },
  itemRow: {
    borderBottom: `1px solid ${colors.border}`,
    padding: "10px 0",
  },
  itemTitle: {
    color: colors.ink,
    fontSize: "14px",
    fontWeight: 600,
    margin: 0,
  },
  itemMeta: {
    color: colors.inkSoft,
    fontSize: "13px",
    margin: "2px 0 0",
  },
  itemPrice: {
    color: colors.ink,
    fontSize: "14px",
    fontWeight: 600,
    margin: 0,
    textAlign: "right" as const,
  },
  totalRow: {
    padding: "6px 0",
  },
  totalLabel: {
    color: colors.inkSoft,
    fontSize: "14px",
    margin: 0,
  },
  totalValue: {
    color: colors.ink,
    fontSize: "14px",
    fontWeight: 600,
    margin: 0,
    textAlign: "right" as const,
  },
  grandTotalLabel: {
    color: colors.ink,
    fontSize: "16px",
    fontWeight: 700,
    margin: 0,
  },
  grandTotalValue: {
    color: colors.terracotta,
    fontSize: "16px",
    fontWeight: 700,
    margin: 0,
    textAlign: "right" as const,
  },
  hr: {
    borderColor: colors.border,
    margin: "24px 0",
  },
  footer: {
    padding: "24px 32px",
    backgroundColor: colors.creamSoft,
  },
  footerText: {
    color: colors.inkSoft,
    fontSize: "12px",
    lineHeight: "18px",
    margin: 0,
  },
} as const;
