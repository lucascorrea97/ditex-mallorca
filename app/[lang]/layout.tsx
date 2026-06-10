import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { hasLocale, getDictionary, locales } from "@/lib/i18n";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  // Staging is never indexed until the big-bang cutover (ADR-0005 / ADR-0013).
  robots: { index: false, follow: false },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header locale={lang} dict={dict} />
        <main className="flex-1">{children}</main>
        <Footer locale={lang} dict={dict} />
      </body>
    </html>
  );
}
