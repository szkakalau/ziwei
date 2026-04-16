import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Lora,
  IBM_Plex_Mono,
} from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import LayoutChrome from "@/components/LayoutChrome";
import { BRAND_NAME, DEFAULT_META_DESCRIPTION } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
  display: "swap",
});

const body = Lora({
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

const defaultTitle = `${BRAND_NAME} | Purple Star Astrology Reading (AI-Powered)`;

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
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: DEFAULT_META_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07090d",
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
        <LayoutChrome>{children}</LayoutChrome>
        <Analytics />
      </body>
    </html>
  );
}
