import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@/app/globals.css";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import {
  hasLocale,
  getDictionary,
  locales,
  defaultLocale,
  localePath,
} from "@/lib/i18n";
import { JsonLd } from "@/components/seo/json-ld";
import { localBusinessJsonLd } from "@/lib/json-ld";
import { SITE_URL, absoluteUrl, ogLocale } from "@/lib/seo";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  return {
    // Resolves all relative metadata URLs against the canonical host (ADR-0004).
    metadataBase: new URL(SITE_URL),
    title: dict.metadata.defaultTitle,
    description: dict.metadata.defaultDescription,
    // Staging is never indexed until the big-bang cutover (ADR-0005 / ADR-0013).
    // Flipping this on (and wiring robots.ts + sitemap) is the cutover task, not #9.
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: "D.TEX Mallorca",
      locale: ogLocale(locale),
      url: absoluteUrl(localePath(locale, "/")),
      title: dict.metadata.defaultTitle,
      description: dict.metadata.defaultDescription,
    },
  };
}

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
        <JsonLd data={localBusinessJsonLd(dict.metadata.defaultDescription)} />
        <Header locale={lang} dict={dict} />
        <main className="flex-1">{children}</main>
        <Footer locale={lang} dict={dict} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
