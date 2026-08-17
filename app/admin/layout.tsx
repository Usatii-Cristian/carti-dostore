import type { Metadata } from "next";
import "../globals.css";
import { inter } from "@/app/fonts";

export const metadata: Metadata = {
  title: "Dostore Carti Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
