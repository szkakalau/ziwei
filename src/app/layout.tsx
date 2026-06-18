import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import LayoutChrome from "@/components/LayoutChrome";
import { BRAND_NAME, DEFAULT_META_DESCRIPTION, DEFAULT_SUPPORT_EMAIL } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "600"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = getSiteUrl();

const defaultTitle = `${BRAND_NAME} | Zi Wei Dou Shu Email Reading`;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: defaultTitle,
    template: `%s | ${BRAND_NAME}`,
  },
  description: DEFAULT_META_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: BRAND_NAME,
    title: defaultTitle,
    description: DEFAULT_META_DESCRIPTION,
    images: [
      {
        url: new URL("/opengraph-image", siteUrl).toString(),
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} — Daily Zi Wei Dou Shu Horoscopes`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: DEFAULT_META_DESCRIPTION,
    images: [
      {
        url: new URL("/opengraph-image", siteUrl).toString(),
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} — Daily Zi Wei Dou Shu Horoscopes`,
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "oklch(0.13 0.032 258)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA4_ID;
  return (
    <html lang="en-US">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen font-body antialiased`}
      >
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${gaId}', { send_page_view: true });
              `}
            </Script>
          </>
        ) : null}
        {/* JSON-LD Structured Data */}
        <JsonLd
          data={{
            "@type": "Organization",
            name: BRAND_NAME,
            url: siteUrl.toString(),
            description: DEFAULT_META_DESCRIPTION,
            email: DEFAULT_SUPPORT_EMAIL,
          }}
        />
        <JsonLd
          data={{
            "@type": "WebSite",
            name: BRAND_NAME,
            url: siteUrl.toString(),
          }}
        />
        <LayoutChrome>{children}</LayoutChrome>
      </body>
    </html>
  );
}
