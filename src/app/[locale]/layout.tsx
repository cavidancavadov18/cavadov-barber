import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Cinzel, Outfit } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { MobileDock } from "@/components/layout/MobileDock";
import { SiteContentProvider } from "@/components/layout/SiteContentContext";
import { getSiteContent } from "@/lib/site-content";
import "../globals.css";

const cinzel = Cinzel({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const content = await getSiteContent();
  const title = t("title");
  const description = t("description");
  const ogImage = `${siteUrl}${content.settings.heroImage}`;

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    icons: {
      icon: content.settings.brandAvatar,
      apple: content.settings.brandAvatar,
    },
    openGraph: {
      title,
      description,
      locale: locale === "en" ? "en_US" : "az_AZ",
      type: "website",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      languages: {
        az: `${siteUrl}/az`,
        en: `${siteUrl}/en`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const siteContent = await getSiteContent();

  return (
    <html lang={locale} className={`${cinzel.variable} ${outfit.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SiteContentProvider value={siteContent}>
            <Navbar />
            {children}
            <Footer />
            <WhatsAppFab />
            <MobileDock />
          </SiteContentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
