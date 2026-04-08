import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Lora,
  IBM_Plex_Mono,
} from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default:
      "Ziwei AI | Purple Star Astrology Reading (AI-Powered)",
    template: "%s | Ziwei AI",
  },
  description:
    "Get a modern, AI-powered read on your Purple Star (Zi Wei Dou Shu) chart—personality, relationships, and life themes. Free preview.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Ziwei AI",
    title: "Ziwei AI | Purple Star Astrology Reading (AI-Powered)",
    description:
      "Get a modern, AI-powered read on your Purple Star chart—personality, relationships, and life themes. Free preview.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ziwei AI | Purple Star Astrology Reading (AI-Powered)",
    description:
      "Get a modern, AI-powered read on your Purple Star chart—personality, relationships, and life themes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen font-body antialiased`}
      >
        <Navbar />
        <main className="min-h-[calc(100vh-8rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
