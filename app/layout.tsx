import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "D.TEX Mallorca — Espuma a medida y materiales para tapicería",
  description:
    "Distribuidor de referencia en espuma a medida (corte en m³), telas, polipieles, PVC y accesorios para tapicería profesional en Mallorca y Baleares.",
  // Staging is never indexed until the big-bang cutover (ADR-0005 / ADR-0013).
  // The robots.ts file blocks crawling; this is belt-and-braces at the meta level.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
